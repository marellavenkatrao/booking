const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const HallBooking = require('../models/HallBooking');
const ExaminerRequest = require('../models/ExaminerRequest');
const StationaryRequest = require('../models/StationaryRequest');
const SeminarHall = require('../models/SeminarHall');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

/**
 * 1. COORDINATOR REPORT:
 * Usage of Seminar Halls by Different Departments in given From and To dates
 * GET /api/reports/coordinator/department-usage
 */
router.get('/coordinator/department-usage', authMiddleware, async (req, res) => {
  try {
    const { fromDate, toDate, hallId, status, department } = req.query;

    let query = {};

    // Date range filter (format YYYY-MM-DD) supporting multi-day bookings
    if (fromDate && toDate) {
      query.$and = [
        {
          $or: [
            { fromDate: { $lte: toDate } },
            { date: { $lte: toDate } }
          ]
        },
        {
          $or: [
            { toDate: { $gte: fromDate } },
            { date: { $gte: fromDate } }
          ]
        }
      ];
    } else if (fromDate) {
      query.$or = [
        { toDate: { $gte: fromDate } },
        { date: { $gte: fromDate } }
      ];
    } else if (toDate) {
      query.$or = [
        { fromDate: { $lte: toDate } },
        { date: { $lte: toDate } }
      ];
    }

    // Hall filter:
    if (hallId && hallId !== 'ALL') {
      if (mongoose.isValidObjectId(hallId)) {
        query.hall = hallId;
      }
    } else if (req.user.role === 'COORDINATOR' && req.user.assignedHall) {
      // Coordinator defaults to their assigned hall if no specific hall is picked
      query.hall = req.user.assignedHall._id || req.user.assignedHall;
    }

    // Status filter
    if (status && status !== 'ALL') {
      query.status = status;
    }

    // Department filter
    if (department && department !== 'ALL') {
      query.department = department;
    }

    const bookings = await HallBooking.find(query)
      .populate('hall')
      .populate('hod', 'name email department phone')
      .populate('coordinator', 'name email phone')
      .sort({ date: 1, startTime: 1 });

    // Find hall information if single hall
    let targetHallInfo = null;
    if (query.hall) {
      targetHallInfo = await SeminarHall.findById(query.hall);
    }

    // Department-wise aggregation
    const deptMap = {};
    let totalAudience = 0;
    let totalApproved = 0;
    let totalPending = 0;
    let totalRejected = 0;
    let totalHours = 0;

    bookings.forEach((b) => {
      const deptName = b.department || 'General';
      if (!deptMap[deptName]) {
        deptMap[deptName] = {
          department: deptName,
          totalBookings: 0,
          approvedCount: 0,
          pendingCount: 0,
          rejectedCount: 0,
          totalAudience: 0,
          totalHours: 0,
          slots: { FN: 0, AN: 0, FULL_DAY: 0, CUSTOM: 0 },
          eventTypes: {},
          bookings: []
        };
      }

      const d = deptMap[deptName];
      d.totalBookings += 1;
      if (b.status === 'APPROVED') {
        d.approvedCount += 1;
        totalApproved += 1;
      } else if (b.status === 'PENDING') {
        d.pendingCount += 1;
        totalPending += 1;
      } else if (b.status === 'REJECTED') {
        d.rejectedCount += 1;
        totalRejected += 1;
      }

      const aud = Number(b.expectedAudience) || 0;
      d.totalAudience += aud;
      totalAudience += aud;

      // Slot calculation
      const slot = b.slot || 'FN';
      d.slots[slot] = (d.slots[slot] || 0) + 1;

      // Estimated duration
      const durationHours = slot === 'FULL_DAY' ? 7 : (slot === 'FN' || slot === 'AN') ? 3 : 3;
      d.totalHours += durationHours;
      totalHours += durationHours;

      // Event type count
      const type = b.eventType || 'Other';
      d.eventTypes[type] = (d.eventTypes[type] || 0) + 1;

      d.bookings.push({
        _id: b._id,
        bookingId: b.bookingId,
        date: b.date,
        slot: b.slot,
        startTime: b.startTime,
        endTime: b.endTime,
        eventName: b.eventName,
        eventType: b.eventType,
        expectedAudience: b.expectedAudience,
        status: b.status,
        passNumber: b.passNumber,
        hodName: b.hodName,
        hallName: b.hallName,
        coordinatorRemarks: b.coordinatorRemarks
      });
    });

    const departmentList = Object.values(deptMap).map(d => ({
      ...d,
      sharePercentage: bookings.length > 0 ? Math.round((d.totalBookings / bookings.length) * 100) : 0
    })).sort((a, b) => b.totalBookings - a.totalBookings);

    res.json({
      success: true,
      reportType: 'COORDINATOR_DEPARTMENT_USAGE',
      filters: {
        fromDate: fromDate || '',
        toDate: toDate || '',
        hallId: hallId || 'ALL',
        status: status || 'ALL',
        department: department || 'ALL'
      },
      targetHall: targetHallInfo ? {
        _id: targetHallInfo._id,
        name: targetHallInfo.name,
        code: targetHallInfo.code,
        capacity: targetHallInfo.capacity,
        coordinatorName: targetHallInfo.coordinatorName
      } : null,
      summary: {
        totalBookings: bookings.length,
        totalApproved,
        totalPending,
        totalRejected,
        totalAudience,
        totalHours,
        departmentsCount: departmentList.length,
        mostActiveDepartment: departmentList.length > 0 ? departmentList[0].department : 'None'
      },
      departmentStats: departmentList,
      bookings
    });
  } catch (err) {
    console.error('[Report Error - Coordinator]', err);
    res.status(500).json({ message: 'Error generating coordinator usage report', error: err.message });
  }
});

/**
 * 2. HOD REPORT - SEMINAR HALL USAGE:
 * Usage of different seminar halls in given From and To dates
 * GET /api/reports/hod/hall-usage
 */
router.get('/hod/hall-usage', authMiddleware, async (req, res) => {
  try {
    const { fromDate, toDate, hallId, status } = req.query;

    let query = {};

    // HOD only sees bookings for their department
    if (req.user.role === 'HOD') {
      query.hod = req.user._id;
    }

    // Date range filter supporting multi-day bookings
    if (fromDate && toDate) {
      query.$and = [
        {
          $or: [
            { fromDate: { $lte: toDate } },
            { date: { $lte: toDate } }
          ]
        },
        {
          $or: [
            { toDate: { $gte: fromDate } },
            { date: { $gte: fromDate } }
          ]
        }
      ];
    } else if (fromDate) {
      query.$or = [
        { toDate: { $gte: fromDate } },
        { date: { $gte: fromDate } }
      ];
    } else if (toDate) {
      query.$or = [
        { fromDate: { $lte: toDate } },
        { date: { $lte: toDate } }
      ];
    }

    if (hallId && hallId !== 'ALL' && mongoose.isValidObjectId(hallId)) {
      query.hall = hallId;
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    const bookings = await HallBooking.find(query)
      .populate('hall')
      .populate('coordinator', 'name email phone')
      .sort({ date: 1, startTime: 1 });

    // Aggregate by Hall
    const hallMap = {};
    let totalAudience = 0;
    let approvedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;
    let totalHours = 0;

    bookings.forEach(b => {
      const hName = b.hallName || 'Seminar Hall';
      if (!hallMap[hName]) {
        hallMap[hName] = {
          hallName: hName,
          hallId: b.hall?._id || b.hall,
          hallCode: b.hall?.code || '',
          capacity: b.hall?.capacity || 250,
          totalBookings: 0,
          approvedCount: 0,
          pendingCount: 0,
          rejectedCount: 0,
          totalAudience: 0,
          totalHours: 0,
          slots: { FN: 0, AN: 0, FULL_DAY: 0, CUSTOM: 0 },
          bookings: []
        };
      }

      const h = hallMap[hName];
      h.totalBookings += 1;
      if (b.status === 'APPROVED') {
        h.approvedCount += 1;
        approvedCount += 1;
      } else if (b.status === 'PENDING') {
        h.pendingCount += 1;
        pendingCount += 1;
      } else if (b.status === 'REJECTED') {
        h.rejectedCount += 1;
        rejectedCount += 1;
      }

      const aud = Number(b.expectedAudience) || 0;
      h.totalAudience += aud;
      totalAudience += aud;

      const slot = b.slot || 'FN';
      h.slots[slot] = (h.slots[slot] || 0) + 1;

      const dur = slot === 'FULL_DAY' ? 7 : (slot === 'FN' || slot === 'AN') ? 3 : 3;
      h.totalHours += dur;
      totalHours += dur;

      h.bookings.push({
        _id: b._id,
        bookingId: b.bookingId,
        date: b.date,
        slot: b.slot,
        startTime: b.startTime,
        endTime: b.endTime,
        eventName: b.eventName,
        eventType: b.eventType,
        expectedAudience: b.expectedAudience,
        status: b.status,
        passNumber: b.passNumber,
        coordinatorRemarks: b.coordinatorRemarks
      });
    });

    const hallList = Object.values(hallMap).map(h => ({
      ...h,
      sharePercentage: bookings.length > 0 ? Math.round((h.totalBookings / bookings.length) * 100) : 0
    })).sort((a, b) => b.totalBookings - a.totalBookings);

    res.json({
      success: true,
      reportType: 'HOD_HALL_USAGE',
      department: req.user.department,
      hodName: req.user.name,
      filters: {
        fromDate: fromDate || '',
        toDate: toDate || '',
        hallId: hallId || 'ALL',
        status: status || 'ALL'
      },
      summary: {
        totalBookings: bookings.length,
        approvedPasses: approvedCount,
        pendingBookings: pendingCount,
        rejectedBookings: rejectedCount,
        totalAudience,
        totalHours,
        hallsUtilizedCount: hallList.length
      },
      hallStats: hallList,
      bookings
    });
  } catch (err) {
    console.error('[Report Error - HOD Hall Usage]', err);
    res.status(500).json({ message: 'Error generating HOD hall usage report', error: err.message });
  }
});

/**
 * 3. HOD REPORT - EXTERNAL EXAMINER HOSPITALITY & ACCOMMODATION SANCTIONS:
 * External Examiner Hospitality & Accommodation Sanctions in given From and To dates
 * GET /api/reports/hod/examiner-sanctions
 */
router.get('/hod/examiner-sanctions', authMiddleware, async (req, res) => {
  try {
    const { fromDate, toDate, status } = req.query;

    let query = {};

    // HOD only sees requests for their department
    if (req.user.role === 'HOD') {
      query.hod = req.user._id;
    }

    // Date range filter against examDateFrom or examDateTo
    if (fromDate && toDate) {
      query.$or = [
        { examDateFrom: { $gte: fromDate, $lte: toDate } },
        { examDateTo: { $gte: fromDate, $lte: toDate } },
        { $and: [{ examDateFrom: { $lte: fromDate } }, { examDateTo: { $gte: toDate } }] }
      ];
    } else if (fromDate) {
      query.$or = [
        { examDateFrom: { $gte: fromDate } },
        { examDateTo: { $gte: fromDate } }
      ];
    } else if (toDate) {
      query.$or = [
        { examDateFrom: { $lte: toDate } },
        { examDateTo: { $lte: toDate } }
      ];
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    const requests = await ExaminerRequest.find(query)
      .populate('hod', 'name email department phone')
      .populate('aoOfficer', 'name email designation phone')
      .sort({ examDateFrom: -1 });

    // Aggregate statistics
    let totalExaminers = 0;
    let approvedSanctions = 0;
    let pendingRequisitions = 0;
    let rejectedRequisitions = 0;
    let totalRoomsAllocated = 0;
    let totalBreakfastCount = 0;
    let totalLunchCount = 0;
    let totalMorningTeaCount = 0;
    let totalEveningTeaCount = 0;
    let totalDinnerCount = 0;

    requests.forEach(r => {
      if (r.status === 'APPROVED') {
        approvedSanctions += 1;
        if (r.accommodation?.required) {
          totalRoomsAllocated += Number(r.accommodation.roomCount) || 1;
        }
      } else if (r.status === 'PENDING') {
        pendingRequisitions += 1;
      } else if (r.status === 'REJECTED') {
        rejectedRequisitions += 1;
      }

      if (r.examiners && Array.isArray(r.examiners)) {
        totalExaminers += r.examiners.length;
      }

      if (r.food) {
        if (r.food.breakfast?.required) totalBreakfastCount += Number(r.food.breakfast.count) || 0;
        if (r.food.lunch?.required) totalLunchCount += Number(r.food.lunch.count) || 0;
        if (r.food.morningTea?.required) totalMorningTeaCount += Number(r.food.morningTea.count) || 0;
        if (r.food.eveningTea?.required) totalEveningTeaCount += Number(r.food.eveningTea.count) || 0;
        if (r.food.dinner?.required) totalDinnerCount += Number(r.food.dinner.count) || 0;
      }
    });

    res.json({
      success: true,
      reportType: 'HOD_EXAMINER_SANCTIONS',
      department: req.user.department,
      hodName: req.user.name,
      filters: {
        fromDate: fromDate || '',
        toDate: toDate || '',
        status: status || 'ALL'
      },
      summary: {
        totalRequisitions: requests.length,
        approvedSanctions,
        pendingRequisitions,
        rejectedRequisitions,
        totalExaminersHosted: totalExaminers,
        totalRoomsAllocated,
        cateringTotals: {
          breakfast: totalBreakfastCount,
          lunch: totalLunchCount,
          morningTea: totalMorningTeaCount,
          eveningTea: totalEveningTeaCount,
          dinner: totalDinnerCount
        }
      },
      requests
    });
  } catch (err) {
    console.error('[Report Error - HOD Examiner Sanctions]', err);
    res.status(500).json({ message: 'Error generating HOD examiner sanctions report', error: err.message });
  }
});

/**
 * 4. AO REPORT - ALL SANCTIONS DEPARTMENT-WISE:
 * In AO login give the report for all sanctions department-wise
 * GET /api/reports/ao/department-sanctions
 */
router.get('/ao/department-sanctions', authMiddleware, async (req, res) => {
  try {
    const { fromDate, toDate, department, category, status } = req.query;

    // 1. Build Examiner Requests Query
    let examinerQuery = {};
    if (department && department !== 'ALL') {
      examinerQuery.department = department;
    }
    if (status && status !== 'ALL') {
      examinerQuery.status = status;
    }
    if (fromDate && toDate) {
      examinerQuery.$or = [
        { examDateFrom: { $gte: fromDate, $lte: toDate } },
        { examDateTo: { $gte: fromDate, $lte: toDate } },
        { actionDate: { $gte: new Date(fromDate), $lte: new Date(toDate + 'T23:59:59.999Z') } },
        { createdAt: { $gte: new Date(fromDate), $lte: new Date(toDate + 'T23:59:59.999Z') } }
      ];
    } else if (fromDate) {
      examinerQuery.$or = [
        { examDateFrom: { $gte: fromDate } },
        { createdAt: { $gte: new Date(fromDate) } }
      ];
    } else if (toDate) {
      examinerQuery.$or = [
        { examDateTo: { $lte: toDate } },
        { createdAt: { $lte: new Date(toDate + 'T23:59:59.999Z') } }
      ];
    }

    // 2. Build Stationary Requests Query
    let stationaryQuery = {};
    if (department && department !== 'ALL') {
      stationaryQuery.department = department;
    }
    if (status && status !== 'ALL') {
      stationaryQuery.status = status;
    }
    if (fromDate && toDate) {
      stationaryQuery.$or = [
        { requiredByDate: { $gte: fromDate, $lte: toDate } },
        { actionDate: { $gte: new Date(fromDate), $lte: new Date(toDate + 'T23:59:59.999Z') } },
        { createdAt: { $gte: new Date(fromDate), $lte: new Date(toDate + 'T23:59:59.999Z') } }
      ];
    } else if (fromDate) {
      stationaryQuery.$or = [
        { requiredByDate: { $gte: fromDate } },
        { createdAt: { $gte: new Date(fromDate) } }
      ];
    } else if (toDate) {
      stationaryQuery.$or = [
        { requiredByDate: { $lte: toDate } },
        { createdAt: { $lte: new Date(toDate + 'T23:59:59.999Z') } }
      ];
    }

    // Decide which collections to fetch based on category ('ALL' | 'EXAMINER' | 'STATIONARY')
    let examinerRequests = [];
    let stationaryRequests = [];

    if (!category || category === 'ALL' || category === 'EXAMINER') {
      examinerRequests = await ExaminerRequest.find(examinerQuery)
        .populate('hod', 'name email department phone')
        .populate('aoOfficer', 'name email designation phone')
        .sort({ createdAt: -1 });
    }

    if (!category || category === 'ALL' || category === 'STATIONARY') {
      stationaryRequests = await StationaryRequest.find(stationaryQuery)
        .populate('requestedBy', 'name email department designation phone')
        .populate('aoOfficer', 'name email designation phone')
        .sort({ createdAt: -1 });
    }

    // Department-wise aggregation
    const deptMap = {};

    const getOrCreateDept = (deptName) => {
      const cleanName = deptName || 'General Administration';
      if (!deptMap[cleanName]) {
        deptMap[cleanName] = {
          department: cleanName,
          totalRequisitions: 0,
          totalSanctionsIssued: 0,
          totalPending: 0,
          totalRejected: 0,
          examiner: {
            total: 0,
            approved: 0,
            pending: 0,
            rejected: 0,
            totalExaminers: 0,
            roomsAllocated: 0,
            sanctions: []
          },
          stationary: {
            total: 0,
            approved: 0,
            issued: 0,
            pending: 0,
            rejected: 0,
            totalItemsSanctioned: 0,
            sanctions: []
          },
          unifiedSanctionsList: []
        };
      }
      return deptMap[cleanName];
    };

    // Process Examiner Requests
    examinerRequests.forEach(reqItem => {
      const d = getOrCreateDept(reqItem.department);
      d.totalRequisitions += 1;
      d.examiner.total += 1;

      const examinersCount = reqItem.examiners?.length || 1;
      d.examiner.totalExaminers += examinersCount;

      if (reqItem.status === 'APPROVED') {
        d.totalSanctionsIssued += 1;
        d.examiner.approved += 1;
        if (reqItem.accommodation?.required) {
          d.examiner.roomsAllocated += Number(reqItem.accommodation.roomCount) || 1;
        }
      } else if (reqItem.status === 'PENDING') {
        d.totalPending += 1;
        d.examiner.pending += 1;
      } else if (reqItem.status === 'REJECTED') {
        d.totalRejected += 1;
        d.examiner.rejected += 1;
      }

      const sanctionObj = {
        _id: reqItem._id,
        sanctionType: 'EXAMINER_HOSPITALITY',
        typeLabel: 'External Examiner Hospitality & Accommodation',
        categoryTag: 'Hospitality',
        requisitionNo: reqItem.requisitionNo,
        sanctionOrderNo: reqItem.sanctionOrderNo || '—',
        requestorName: reqItem.hodName,
        subjectOrPurpose: reqItem.examSubject,
        purposeCategory: reqItem.purpose,
        dates: `${reqItem.examDateFrom} ${reqItem.examDateTo && reqItem.examDateTo !== reqItem.examDateFrom ? 'to ' + reqItem.examDateTo : ''}`,
        sanctionDate: reqItem.actionDate || reqItem.createdAt,
        status: reqItem.status,
        aoRemarks: reqItem.aoRemarks,
        keyDetails: reqItem.accommodation?.required 
          ? `${reqItem.accommodation.allocatedRoom || reqItem.accommodation.roomType} (${reqItem.accommodation.roomCount} Room(s)) • ${examinersCount} Examiner(s)`
          : `Hospitality only • ${examinersCount} Examiner(s)`,
        raw: reqItem
      };

      d.examiner.sanctions.push(sanctionObj);
      d.unifiedSanctionsList.push(sanctionObj);
    });

    // Process Stationary Requests
    stationaryRequests.forEach(reqItem => {
      const d = getOrCreateDept(reqItem.department);
      d.totalRequisitions += 1;
      d.stationary.total += 1;

      let sanctionedCount = 0;
      if (reqItem.items && Array.isArray(reqItem.items)) {
        reqItem.items.forEach(it => {
          if (it.quantitySanctioned !== null && it.quantitySanctioned !== undefined) {
            sanctionedCount += Number(it.quantitySanctioned);
          }
        });
      }
      d.stationary.totalItemsSanctioned += sanctionedCount;

      if (['APPROVED', 'ISSUED'].includes(reqItem.status)) {
        d.totalSanctionsIssued += 1;
        if (reqItem.status === 'APPROVED') d.stationary.approved += 1;
        if (reqItem.status === 'ISSUED') d.stationary.issued += 1;
      } else if (reqItem.status === 'PENDING') {
        d.totalPending += 1;
        d.stationary.pending += 1;
      } else if (reqItem.status === 'REJECTED') {
        d.totalRejected += 1;
        d.stationary.rejected += 1;
      }

      const itemsSummary = reqItem.items?.map(it => 
        `${it.itemName} (${it.quantitySanctioned ?? it.quantityRequested} ${it.unit})`
      ).slice(0, 3).join(', ') + (reqItem.items?.length > 3 ? ` +${reqItem.items.length - 3} more` : '');

      const sanctionObj = {
        _id: reqItem._id,
        sanctionType: 'STATIONERY',
        typeLabel: 'Central Store Stationery Sanction',
        categoryTag: 'Stationery',
        requisitionNo: reqItem.requisitionNo,
        sanctionOrderNo: reqItem.sanctionOrderNo || '—',
        requestorName: reqItem.requestorName,
        subjectOrPurpose: reqItem.purpose,
        purposeCategory: reqItem.urgency,
        dates: `Needed by ${reqItem.requiredByDate}`,
        sanctionDate: reqItem.actionDate || reqItem.createdAt,
        status: reqItem.status,
        aoRemarks: reqItem.aoRemarks,
        keyDetails: itemsSummary,
        raw: reqItem
      };

      d.stationary.sanctions.push(sanctionObj);
      d.unifiedSanctionsList.push(sanctionObj);
    });

    const departmentList = Object.values(deptMap).map(d => ({
      ...d,
      approvalRate: d.totalRequisitions > 0 
        ? Math.round((d.totalSanctionsIssued / d.totalRequisitions) * 100) 
        : 0
    })).sort((a, b) => b.totalSanctionsIssued - a.totalSanctionsIssued);

    // Global summary
    let totalSanctionsAcrossDepts = 0;
    let totalRequisitionsAcrossDepts = 0;
    let totalPendingAcrossDepts = 0;
    let totalExaminerSanctionsCount = 0;
    let totalStationerySanctionsCount = 0;
    let totalRoomsAllocatedOverall = 0;
    let totalExaminersOverall = 0;

    departmentList.forEach(d => {
      totalSanctionsAcrossDepts += d.totalSanctionsIssued;
      totalRequisitionsAcrossDepts += d.totalRequisitions;
      totalPendingAcrossDepts += d.totalPending;
      totalExaminerSanctionsCount += d.examiner.approved;
      totalStationerySanctionsCount += (d.stationary.approved + d.stationary.issued);
      totalRoomsAllocatedOverall += d.examiner.roomsAllocated;
      totalExaminersOverall += d.examiner.totalExaminers;
    });

    res.json({
      success: true,
      reportType: 'AO_DEPARTMENT_SANCTIONS',
      filters: {
        fromDate: fromDate || '',
        toDate: toDate || '',
        department: department || 'ALL',
        category: category || 'ALL',
        status: status || 'ALL'
      },
      summary: {
        totalDepartments: departmentList.length,
        totalRequisitions: totalRequisitionsAcrossDepts,
        totalSanctionsIssued: totalSanctionsAcrossDepts,
        totalPending: totalPendingAcrossDepts,
        totalExaminerSanctions: totalExaminerSanctionsCount,
        totalStationerySanctions: totalStationerySanctionsCount,
        totalRoomsAllocated: totalRoomsAllocatedOverall,
        totalExaminersHosted: totalExaminersOverall,
        overallApprovalRate: totalRequisitionsAcrossDepts > 0 
          ? Math.round((totalSanctionsAcrossDepts / totalRequisitionsAcrossDepts) * 100) 
          : 0
      },
      departments: departmentList
    });
  } catch (err) {
    console.error('[Report Error - AO Department Sanctions]', err);
    res.status(500).json({ message: 'Error generating AO department-wise sanctions report', error: err.message });
  }
});

module.exports = router;
