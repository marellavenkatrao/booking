const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const SeminarHall = require('./models/SeminarHall');
const HallBooking = require('./models/HallBooking');
const ExaminerRequest = require('./models/ExaminerRequest');
const StationaryRequest = require('./models/StationaryRequest');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nec_portal';

async function seed() {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected.');

    // Clear existing collections
    await User.deleteMany({});
    await SeminarHall.deleteMany({});
    await HallBooking.deleteMany({});
    await ExaminerRequest.deleteMany({});
    await StationaryRequest.deleteMany({});
    console.log('[Seed] Cleared existing data.');

    const defaultPassword = await bcrypt.hash('nec@123', 10);

    // 1. Create Coordinators and Dual-Role Faculty
    // Block-2 Coordinator & CSE HOD: Dr S N Tirumala Rao
    const userCse = await User.create({
      name: 'Dr S N Tirumala Rao',
      email: 'csehod@nrtec.in',
      password: defaultPassword,
      role: 'HOD',
      roles: ['HOD', 'COORDINATOR'],
      department: 'Computer Science & Engineering (CSE)',
      designation: 'Professor & HOD (CSE) | Block-2 Seminar Hall Coordinator',
      phone: '8247394015',
      landline: '08647-239912'
    });

    // Block-3 Coordinator & ECE HOD: Dr. V. VENKATA RAO
    const userEce = await User.create({
      name: 'Dr. V. VENKATA RAO',
      email: 'ecehod@nrtec.in',
      password: defaultPassword,
      role: 'HOD',
      roles: ['HOD', 'COORDINATOR'],
      department: 'Electronics & Communication Engineering (ECE)',
      designation: 'Professor & HOD (ECE) | Block-3 Seminar Hall Coordinator',
      phone: '9441127485',
      landline: '08647-239914'
    });

    // Block-4 Coordinator: Dr. D.Suneel (Vice Principal)
    const userVicePrincipal = await User.create({
      name: 'Dr. D.Suneel',
      email: 'viceprincipal@nrtec.in',
      password: defaultPassword,
      role: 'COORDINATOR',
      roles: ['COORDINATOR'],
      department: 'Mechanical Engineering & Administration',
      designation: 'Vice Principal & Coordinator - Block-4 Seminar Hall',
      phone: '9441127485'
    });

    // 2. Create the 3 Official Seminar Halls
    const hall1 = await SeminarHall.create({
      name: 'Block-2 Seminar Hall',
      code: 'BLOCK-2',
      block: 'Block-2',
      capacity: 250,
      coordinator: userCse._id,
      coordinatorName: 'Dr S N Tirumala Rao',
      coordinatorPhone: '8247394015',
      coordinatorEmail: 'csehod@nrtec.in',
      location: 'Ground Floor, Block-2 (Main Admin & CSE Wing)',
      description: 'Air-conditioned seminar hall equipped with high-lumen laser projector, motorized screen, JBL surround audio, podium mic, and wireless lapel mics. Ideal for workshops and guest lectures.',
      facilities: ['Centralized AC', 'High-Lumen Projector', 'JBL Sound System', 'Smart Podium & Mic', 'High-Speed Wi-Fi', 'Motorized Screen']
    });

    const hall2 = await SeminarHall.create({
      name: 'Block-3 Seminar Hall',
      code: 'BLOCK-3',
      block: 'Block-3',
      capacity: 320,
      coordinator: userEce._id,
      coordinatorName: 'Dr. V. VENKATA RAO',
      coordinatorPhone: '9441127485',
      coordinatorEmail: 'ecehod@nrtec.in',
      location: 'First Floor, Block-3 (ECE & EEE Wing)',
      description: 'Modern digital hall with interactive LED video wall, video conferencing setup, tiered executive cushioned seating, and advanced acoustic design.',
      facilities: ['Centralized AC', 'Interactive LED Video Wall', 'Polycom Video Conferencing', 'Acoustic Wall Paneling', 'Dual Wireless Mics', 'Recording Camera']
    });

    const hall3 = await SeminarHall.create({
      name: 'Block-4 Seminar Hall',
      code: 'BLOCK-4',
      block: 'Block-4',
      capacity: 450,
      coordinator: userVicePrincipal._id,
      coordinatorName: 'Dr. D.Suneel',
      coordinatorPhone: '9441127485',
      coordinatorEmail: 'viceprincipal@nrtec.in',
      location: 'Second Floor, Block-4 (Mechanical & Civil Wing)',
      description: 'Grand auditorium-style seminar hall with elevated stage, large seating capacity, theatrical stage lighting, green room, and powerful digital public address system.',
      facilities: ['Centralized AC', 'Stage & Theatrical Lighting', 'Dual Projectors', 'Auditorium Seating', 'Digital Audio Mixer', 'Backstage Facility']
    });

    // Update coordinators with assigned hall references
    userCse.assignedHall = hall1._id;
    await userCse.save();

    userEce.assignedHall = hall2._id;
    await userEce.save();

    userVicePrincipal.assignedHall = hall3._id;
    await userVicePrincipal.save();

    // 3. Create Remaining Department HODs
    const userCivil = await User.create({
      name: 'Dr. P. Naga Sowjanya',
      email: 'civilhod@nrtec.in',
      password: defaultPassword,
      role: 'HOD',
      roles: ['HOD'],
      department: 'Civil Engineering (CIVIL)',
      designation: 'Professor & Head of Department - Civil Engineering',
      phone: '+91 8647 239900'
    });

    const userEee = await User.create({
      name: 'Dr. SHAIK MAHAMMAD SHAREEF',
      email: 'hodeee@nrtec.in',
      password: defaultPassword,
      role: 'HOD',
      roles: ['HOD'],
      department: 'Electrical & Electronics Engineering (EEE)',
      designation: 'Professor & Head of Department - EEE',
      phone: '+91 8647 239901'
    });

    const userMech = await User.create({
      name: 'Dr. B. Venkata Siva',
      email: 'mechhod@nrtec.in',
      password: defaultPassword,
      role: 'HOD',
      roles: ['HOD'],
      department: 'Mechanical Engineering (MECH)',
      designation: 'Professor & Head of Department - MECH',
      phone: '9692464540'
    });

    const userIt = await User.create({
      name: 'Dr. B. Jhansi Rani',
      email: 'ithod@nrtec.in',
      password: defaultPassword,
      role: 'HOD',
      roles: ['HOD'],
      department: 'Information Technology (IT)',
      designation: 'Professor & Head of Department - IT',
      phone: '+91 8647 239903'
    });

    const userAicsds = await User.create({
      name: 'Dr. V.V.A.S. Lakshmi',
      email: 'aicsdshod@nrtec.in',
      password: defaultPassword,
      role: 'HOD',
      roles: ['HOD'],
      department: 'CSE - Emerging Technologies [CSE(ET)]',
      designation: 'Professor & Head of Department - CSE(ET)',
      phone: '+91 8647 239904'
    });

    const userMbaMca = await User.create({
      name: 'Dr. S. Sivaram Prasad',
      email: 'mbahod@nrtec.in',
      password: defaultPassword,
      role: 'HOD',
      roles: ['HOD'],
      department: 'Management Studies (MBA & MCA)',
      designation: 'Professor & Head of Department - MBA & MCA',
      phone: '+91 8647 239905'
    });

    const userBsh = await User.create({
      name: 'Dr. K. P. Lakshmi',
      email: 'bshhod@nrtec.in',
      password: defaultPassword,
      role: 'HOD',
      roles: ['HOD'],
      department: 'Basic Sciences & Humanities (BS&H)',
      designation: 'Professor & Head of Department - BS&H',
      phone: '+91 8647 239906'
    });

    // 4. Create Administrative Officer (AO)
    const userAo = await User.create({
      name: 'Sri K. Srinivasa Rao',
      email: 'ao@nrtec.in',
      password: defaultPassword,
      role: 'AO',
      roles: ['AO'],
      department: 'Administrative Office',
      designation: 'Administrative Officer (AO)',
      phone: '+91 94400 99887'
    });

    console.log('[Seed] Created All Real Faculty Accounts, Coordinators, and Seminar Halls.');

    // 5. Create Sample Hall Bookings for Demonstration
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const dayAfter = new Date(Date.now() + 172800000).toISOString().split('T')[0];

    // Approved booking in Block-2 (Approved by Dr S N Tirumala Rao)
    await HallBooking.create({
      bookingId: 'NEC-SH-2026-1001',
      hall: hall1._id,
      hallName: hall1.name,
      hod: userCse._id,
      hodName: userCse.name,
      department: userCse.department,
      eventName: 'National Workshop on Generative AI & Cloud Architecture',
      eventType: 'Workshop',
      date: today,
      slot: 'FN',
      startTime: '09:30 AM',
      endTime: '12:30 PM',
      expectedAudience: 180,
      chiefGuest: 'Mr. B. Satyanarayana, Principal Architect, TCS Hyderabad',
      requirements: {
        projector: true,
        soundSystem: true,
        airConditioning: true,
        podiumMic: true,
        videoRecording: true,
        specialArrangements: 'High bandwidth Wi-Fi for 150 student laptops'
      },
      status: 'APPROVED',
      coordinator: userCse._id,
      coordinatorRemarks: 'Confirmed and scheduled. Technical lab assistants assigned for Wi-Fi and audio arrangements.',
      actionDate: new Date(),
      passNumber: 'NEC/SH-PASS/2026/1001',
      passSentToHod: true,
      passSentAt: new Date(),
      coordinatorSignature: 'Dr S N Tirumala Rao (Professor & Coordinator - Block-2)'
    });

    // Pending booking in Block-2: Submitted by Mechanical HOD for Dr S N Tirumala Rao to approve!
    await HallBooking.create({
      bookingId: 'NEC-SH-2026-1002',
      hall: hall1._id,
      hallName: hall1.name,
      hod: userMech._id,
      hodName: userMech.name,
      department: userMech.department,
      eventName: 'Computational Fluid Dynamics & Industrial Automation Seminar',
      eventType: 'Guest Lecture',
      date: tomorrow,
      slot: 'FULL_DAY',
      startTime: '09:30 AM',
      endTime: '04:30 PM',
      expectedAudience: 200,
      chiefGuest: 'Dr. Anand Kumar, Tech Lead, Infosys',
      requirements: {
        projector: true,
        soundSystem: true,
        airConditioning: true,
        podiumMic: true,
        videoRecording: false,
        specialArrangements: '6 power extension boards for student project displays'
      },
      status: 'PENDING',
      coordinator: userCse._id
    });

    // Pending booking in Block-3: Submitted by IT HOD for Dr. V. VENKATA RAO to approve!
    await HallBooking.create({
      bookingId: 'NEC-SH-2026-1003',
      hall: hall2._id,
      hallName: hall2.name,
      hod: userIt._id,
      hodName: userIt.name,
      department: userIt.department,
      eventName: 'VLSI Chip Design Trends & Embedded IoT Systems Expo',
      eventType: 'Conference',
      date: dayAfter,
      slot: 'FN',
      startTime: '09:30 AM',
      endTime: '12:30 PM',
      expectedAudience: 240,
      chiefGuest: 'Prof. K. Rama Krishna, IIT Hyderabad',
      requirements: {
        projector: true,
        soundSystem: true,
        airConditioning: true,
        podiumMic: true,
        videoRecording: true,
        specialArrangements: 'Interactive LED video wall configuration for live FPGA demonstration'
      },
      status: 'PENDING',
      coordinator: userEce._id
    });

    // Pending booking in Block-4: Submitted by Civil HOD for Dr. D.Suneel to approve!
    await HallBooking.create({
      bookingId: 'NEC-SH-2026-1004',
      hall: hall3._id,
      hallName: hall3.name,
      hod: userCivil._id,
      hodName: userCivil.name,
      department: userCivil.department,
      eventName: 'Sustainable Infrastructure & Smart Cities National Conclave',
      eventType: 'Guest Lecture',
      date: tomorrow,
      slot: 'AN',
      startTime: '01:30 PM',
      endTime: '04:30 PM',
      expectedAudience: 350,
      chiefGuest: 'Sri P. Venkateswara Rao, Chief Engineer, L&T Infrastructure',
      requirements: {
        projector: true,
        soundSystem: true,
        airConditioning: true,
        podiumMic: true,
        videoRecording: true,
        specialArrangements: 'Stage display arrangements for student CAD 3D models'
      },
      status: 'PENDING',
      coordinator: userVicePrincipal._id
    });

    // 6. Create Sample Examiner Hospitality Requests to AO
    await ExaminerRequest.create({
      requisitionNo: 'NEC-AO-REQ-2026-081',
      hod: userCse._id,
      hodName: userCse.name,
      department: userCse.department,
      purpose: 'End Semester Practical / Lab Examination',
      examSubject: 'Advanced Data Structures & Algorithms Lab (20CS301)',
      examDateFrom: tomorrow,
      examDateTo: tomorrow,
      examiners: [
        {
          name: 'Dr. T. Ramanjaneyulu',
          designation: 'Professor in CSE',
          institution: 'JNTUK University College of Engineering, Narasaraopet',
          phone: '+91 94405 11223',
          email: 'ramanjaneyulu.t@jntuk.edu.in'
        }
      ],
      accommodation: {
        required: true,
        roomCount: 1,
        roomType: 'Executive AC Guest Suite',
        checkInDate: tomorrow,
        checkInTime: '08:00 AM',
        checkOutDate: tomorrow,
        checkOutTime: '06:00 PM',
        allocatedRoom: 'Pending AO Allocation'
      },
      food: {
        breakfast: { required: true, count: 2, notes: 'South Indian Breakfast with Coffee' },
        morningTea: { required: true, count: 2, time: '11:00 AM', withSnacks: true },
        lunch: { required: true, count: 2, mealType: 'Special Executive Meals', vegCount: 2, nonVegCount: 0, notes: 'VIP Faculty Lunch' },
        eveningTea: { required: true, count: 2, time: '04:00 PM', withSnacks: true },
        dinner: { required: false, count: 0, notes: '' }
      },
      conveyance: {
        pickupRequired: true,
        pickupLocation: 'Narasaraopet Railway Station',
        pickupTime: '08:15 AM',
        dropRequired: true,
        dropLocation: 'Narasaraopet Railway Station',
        dropTime: '05:30 PM'
      },
      status: 'PENDING',
      generalRemarks: 'External examiner appointed as per JNTUK University order. Kindly arrange prompt station pickup.'
    });

    await ExaminerRequest.create({
      requisitionNo: 'NEC-AO-REQ-2026-080',
      hod: userEee._id,
      hodName: userEee.name,
      department: userEee.department,
      purpose: 'End Semester Practical / Lab Examination',
      examSubject: 'Power Electronics & Drives Viva Voce (22PE102)',
      examDateFrom: today,
      examDateTo: today,
      examiners: [
        {
          name: 'Prof. Ch. Subrahmanyam',
          designation: 'Senior Professor in EEE',
          institution: 'Andhra University College of Engineering, Visakhapatnam',
          phone: '+91 98481 99881',
          email: 'subrahmanyam.eee@andhrauniversity.edu.in'
        }
      ],
      accommodation: {
        required: true,
        roomCount: 1,
        roomType: 'Executive AC Guest Suite',
        checkInDate: today,
        checkInTime: '08:00 AM',
        checkOutDate: today,
        checkOutTime: '06:00 PM',
        allocatedRoom: 'Suite Room 102'
      },
      food: {
        breakfast: { required: true, count: 2, notes: 'South Indian' },
        morningTea: { required: true, count: 3, time: '11:00 AM', withSnacks: true },
        lunch: { required: true, count: 3, mealType: 'Special Executive Meals', vegCount: 3, nonVegCount: 0, notes: 'Arranged in VIP Dining' },
        eveningTea: { required: true, count: 3, time: '04:00 PM', withSnacks: true },
        dinner: { required: false, count: 0, notes: '' }
      },
      conveyance: {
        pickupRequired: false,
        pickupLocation: '',
        pickupTime: '',
        dropRequired: false
      },
      status: 'APPROVED',
      generalRemarks: 'Examiner arrived via own transport. Guest room and VIP lunch required.',
      aoActionDate: new Date(),
      aoRemarks: 'Approved. Executive Suite Room 102 reserved. College pantry notified for VIP lunch.',
      arrangedBy: 'Sri K. Srinivasa Rao (AO)'
    });

    // 7. Create Sample Stationary Requests to AO
    await StationaryRequest.create({
      requisitionNo: 'NEC-STAT-2026-042',
      department: userCse.department,
      requestedBy: userCse._id,
      requestorName: userCse.name,
      requestorDesignation: 'Head of Department - CSE',
      purpose: 'End Semester Examinations',
      urgency: 'EXAM_CRITICAL',
      requiredByDate: tomorrow,
      items: [
        { itemName: 'A4 Printing & Photocopying Paper (75 GSM)', category: 'Paper & Sheets', quantityRequested: 15, unit: 'Reams (500 Sheets)', specification: 'White 75 GSM' },
        { itemName: 'Permanent Whiteboard Markers (Blue & Black)', category: 'Writing Instruments', quantityRequested: 24, unit: 'Pieces / Nos', specification: 'Chisel Tip' },
        { itemName: 'Heavy Duty Stapler & Pin Boxes', category: 'Fasteners & Desktop', quantityRequested: 4, unit: 'Sets', specification: 'No. 10 Stapler' }
      ],
      generalRemarks: 'Examinations commence this Monday. Immediate issue from central stores requested.',
      status: 'PENDING'
    });

    await StationaryRequest.create({
      requisitionNo: 'NEC-STAT-2026-041',
      department: userMech.department,
      requestedBy: userMech._id,
      requestorName: userMech.name,
      requestorDesignation: 'Head of Department - MECH',
      purpose: 'NBA / NAAC Accreditation Documentation',
      urgency: 'ROUTINE',
      requiredByDate: today,
      items: [
        { itemName: 'Document Spring Files (Hard Cover)', category: 'Filing & Folders', quantityRequested: 60, quantitySanctioned: 60, unit: 'Pieces / Nos', specification: 'Box File Index' },
        { itemName: 'A3 Graph Sheets (Centimeter Grid)', category: 'Paper & Sheets', quantityRequested: 200, quantitySanctioned: 200, unit: 'Pieces / Nos', specification: 'Centimeter Grid' }
      ],
      generalRemarks: 'Required for ongoing NAAC criteria documentation verification.',
      status: 'APPROVED',
      aoActionDate: new Date(),
      aoRemarks: 'Approved for issue from College Central Stationery Store on Counter Slip #902.',
      dispatchedDate: new Date(),
      issuedItemsSummary: 'All items dispatched to Mechanical department office.'
    });

    console.log('[Seed] Sample bookings, examiner requisitions, and stationary requests successfully populated.');
    console.log('[Seed] Database seeding completed with 100% REAL faculty & coordinator data!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
    process.exit(1);
  }
}

seed();
