/**
 * EduTrack MIS - Student Attendance Management System
 * Vanilla JavaScript implementation using LocalStorage.
 * No external server or database needed.
 */

// ==========================================
// 1. Initial Sample Seed Data (For First Run)
// ==========================================
const DEFAULT_CLASSES = [
  { id: "CLS-101", code: "MIS-301", name: "Management Information Systems", dept: "Faculty of Computing", room: "Lab 3A" },
  { id: "CLS-102", code: "CS-202", name: "Database Engineering", dept: "Computer Science", room: "Hall B" },
  { id: "CLS-103", code: "SWE-401", name: "Software Project Management", dept: "Software Engineering", room: "Room 102" },
  { id: "CLS-104", code: "BIT-105", name: "Business Analytics", dept: "Business Information", room: "Auditorium" }
];

const DEFAULT_STUDENTS = [
  { id: "STU-2026-001", name: "Ahmed Mohamed Abdi", classId: "CLS-101", gender: "Male", phone: "+252 61 5112233", email: "ahmed.abdi@univ.edu" },
  { id: "STU-2026-002", name: "Fatima Hassan Nuur", classId: "CLS-101", gender: "Female", phone: "+252 61 5223344", email: "fatima.nuur@univ.edu" },
  { id: "STU-2026-003", name: "Khadar Omar Warsame", classId: "CLS-101", gender: "Male", phone: "+252 61 5334455", email: "khadar.warsame@univ.edu" },
  { id: "STU-2026-004", name: "Ayan Jama Cilmi", classId: "CLS-102", gender: "Female", phone: "+252 61 5445566", email: "ayan.jama@univ.edu" },
  { id: "STU-2026-005", name: "Mustafa Ali Farah", classId: "CLS-102", gender: "Male", phone: "+252 61 5556677", email: "mustafa.ali@univ.edu" },
  { id: "STU-2026-006", name: "Hodan Yasin Daahir", classId: "CLS-103", gender: "Female", phone: "+252 61 5667788", email: "hodan.yasin@univ.edu" },
  { id: "STU-2026-007", name: "Zakaria Hussein Shire", classId: "CLS-103", gender: "Male", phone: "+252 61 5778899", email: "zakaria.shire@univ.edu" },
  { id: "STU-2026-008", name: "Safia Abdullahi Geedi", classId: "CLS-104", gender: "Female", phone: "+252 61 5889900", email: "safia.geedi@univ.edu" },
  { id: "STU-2026-009", name: "Abdirahman Gedi Samatar", classId: "CLS-104", gender: "Male", phone: "+252 61 5990011", email: "abdirahman.samatar@univ.edu" },
  { id: "STU-2026-010", name: "Fardowsa Isse Rooble", classId: "CLS-101", gender: "Female", phone: "+252 61 5001122", email: "fardowsa.rooble@univ.edu" }
];

// Helper: Formatted local date string YYYY-MM-DD
function getTodayString(daysOffset = 0) {
  const d = new Date();
  if (daysOffset !== 0) {
    d.setDate(d.getDate() + daysOffset);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate sample attendance records for today and previous days
function generateSampleAttendance() {
  const records = [];
  const today = getTodayString(0);
  const yesterday = getTodayString(-1);
  const dayBefore = getTodayString(-2);

  // Today's records
  const todayStatuses = ["Present", "Present", "Absent", "Late", "Present", "Present", "Absent", "Present", "Late", "Present"];
  DEFAULT_STUDENTS.forEach((st, idx) => {
    records.push({
      id: `ATT-${today}-${st.id}`,
      studentId: st.id,
      date: today,
      status: todayStatuses[idx % todayStatuses.length],
      remarks: todayStatuses[idx % todayStatuses.length] === 'Late' ? 'Traffic delay' : '',
      timestamp: "08:15 AM"
    });
  });

  // Yesterday's records
  DEFAULT_STUDENTS.forEach((st, idx) => {
    records.push({
      id: `ATT-${yesterday}-${st.id}`,
      studentId: st.id,
      date: yesterday,
      status: idx === 2 || idx === 6 ? "Absent" : (idx === 8 ? "Late" : "Present"),
      remarks: '',
      timestamp: "08:10 AM"
    });
  });

  // Day before yesterday's records
  DEFAULT_STUDENTS.forEach((st, idx) => {
    records.push({
      id: `ATT-${dayBefore}-${st.id}`,
      studentId: st.id,
      date: dayBefore,
      status: idx === 2 ? "Absent" : "Present",
      remarks: '',
      timestamp: "08:05 AM"
    });
  });

  return records;
}

// ==========================================
// 2. State & LocalStorage Manager
// ==========================================
class AttendanceStorage {
  static getClasses() {
    const data = localStorage.getItem('edutrack_classes');
    if (!data) {
      localStorage.setItem('edutrack_classes', JSON.stringify(DEFAULT_CLASSES));
      return DEFAULT_CLASSES;
    }
    return JSON.parse(data);
  }

  static saveClasses(classes) {
    localStorage.setItem('edutrack_classes', JSON.stringify(classes));
  }

  static getStudents() {
    const data = localStorage.getItem('edutrack_students');
    if (!data) {
      localStorage.setItem('edutrack_students', JSON.stringify(DEFAULT_STUDENTS));
      return DEFAULT_STUDENTS;
    }
    return JSON.parse(data);
  }

  static saveStudents(students) {
    localStorage.setItem('edutrack_students', JSON.stringify(students));
  }

  static getAttendance() {
    const data = localStorage.getItem('edutrack_attendance');
    if (!data) {
      const sample = generateSampleAttendance();
      localStorage.setItem('edutrack_attendance', JSON.stringify(sample));
      return sample;
    }
    return JSON.parse(data);
  }

  static saveAttendance(records) {
    localStorage.setItem('edutrack_attendance', JSON.stringify(records));
  }
}

// Global active in-memory cache
let appClasses = AttendanceStorage.getClasses();
let appStudents = AttendanceStorage.getStudents();
let appAttendance = AttendanceStorage.getAttendance();

// Delete Action Callback Holder
let pendingConfirmAction = null;

// ==========================================
// 3. UI Navigation & Tabs
// ==========================================
function switchTab(tabId) {
  // Update nav buttons
  document.querySelectorAll('.nav-link').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update tab views
  document.querySelectorAll('.tab-content').forEach(view => {
    view.classList.remove('active');
  });
  const targetView = document.getElementById(`view-${tabId}`);
  if (targetView) {
    targetView.classList.add('active');
  }

  // Close mobile navigation if open
  document.getElementById('navMenu').classList.remove('open');

  // Trigger relevant view updates
  if (tabId === 'dashboard') renderDashboard();
  if (tabId === 'attendance') renderAttendanceRegister();
  if (tabId === 'students') renderStudentsTable();
  if (tabId === 'classes') renderClassesView();
  if (tabId === 'reports') renderReportsView();
}

// Setup Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Navigation tabs
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      const target = link.getAttribute('data-tab');
      switchTab(target);
    });
  });

  // Mobile menu toggle
  const mobileBtn = document.getElementById('mobileMenuBtn');
  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      document.getElementById('navMenu').classList.toggle('open');
    });
  }

  // Set default dates
  const today = getTodayString();
  const dateInput = document.getElementById('attDatePicker');
  if (dateInput) dateInput.value = today;

  const repStart = document.getElementById('repStartDate');
  const repEnd = document.getElementById('repEndDate');
  if (repStart) repStart.value = getTodayString(-7);
  if (repEnd) repEnd.value = today;

  // Initialize dropdowns
  populateAllClassSelects();

  // Initial renders
  renderDashboard();

  // Attach search and filter events
  setupLiveEventListeners();
});

// Populate class options across modals and filters
function populateAllClassSelects() {
  const selects = [
    document.getElementById('attClassSelect'),
    document.getElementById('studentClassFilter'),
    document.getElementById('modalStudentClass'),
    document.getElementById('repClassSelect')
  ];

  selects.forEach(sel => {
    if (!sel) return;
    const isFilter = sel.id !== 'modalStudentClass';
    const currentValue = sel.value;
    sel.innerHTML = isFilter ? '<option value="ALL">All Classes</option>' : '<option value="" disabled selected>Select Class</option>';

    appClasses.forEach(cls => {
      const opt = document.createElement('option');
      opt.value = cls.id;
      opt.textContent = `${cls.code} - ${cls.name}`;
      sel.appendChild(opt);
    });

    if (currentValue) sel.value = currentValue;
  });
}

// ==========================================
// 4. Dashboard View Logic
// ==========================================
function renderDashboard() {
  const today = getTodayString();
  const totalStudents = appStudents.length;

  // Attendance for today
  const todayRecords = appAttendance.filter(r => r.date === today);
  const presentCount = todayRecords.filter(r => r.status === 'Present').length;
  const absentCount = todayRecords.filter(r => r.status === 'Absent').length;
  const lateCount = todayRecords.filter(r => r.status === 'Late').length;
  const excusedCount = todayRecords.filter(r => r.status === 'Excused').length;
  const markedTotal = todayRecords.length;

  const rate = markedTotal > 0 ? Math.round(((presentCount + lateCount) / markedTotal) * 100) : 0;

  // Update KPI counters
  document.getElementById('kpiTotalStudents').textContent = totalStudents;
  document.getElementById('kpiPresentToday').textContent = presentCount;
  document.getElementById('kpiAbsentToday').textContent = absentCount;
  document.getElementById('kpiLateToday').textContent = lateCount;
  document.getElementById('kpiOverallRate').textContent = `${rate}%`;
  document.getElementById('kpiRateFill').style.width = `${rate}%`;

  const presentPercentage = markedTotal > 0 ? Math.round((presentCount / markedTotal) * 100) : 0;
  document.getElementById('kpiPresentRate').textContent = `${presentPercentage}% of today's marked`;

  // Date label
  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const dateBadge = document.getElementById('dashTodayDateLabel');
  if (dateBadge) dateBadge.textContent = todayLabel;

  // Update Donut Visual Graphic
  updateDonutChart(presentCount, absentCount, lateCount, excusedCount, markedTotal, rate);

  // Render Class Bars
  renderDashboardClassBars();

  // Render Recent Activity Table
  renderDashboardRecentActivity();
}

function updateDonutChart(present, absent, late, excused, total, rate) {
  document.getElementById('donutRateText').textContent = `${rate}%`;
  document.getElementById('legPresent').textContent = present;
  document.getElementById('legAbsent').textContent = absent;
  document.getElementById('legLate').textContent = late;
  document.getElementById('legExcused').textContent = excused;

  const donut = document.getElementById('donutGraphic');
  if (!donut) return;

  if (total === 0) {
    donut.style.background = '#e2e8f0';
    return;
  }

  // Calculate degree segments for conic-gradient
  const pDeg = (present / total) * 360;
  const aDeg = pDeg + (absent / total) * 360;
  const lDeg = aDeg + (late / total) * 360;
  const eDeg = lDeg + (excused / total) * 360;

  donut.style.background = `conic-gradient(
    var(--status-present) 0deg ${pDeg}deg,
    var(--status-absent) ${pDeg}deg ${aDeg}deg,
    var(--status-late) ${aDeg}deg ${lDeg}deg,
    var(--status-excused) ${lDeg}deg ${eDeg}deg
  )`;
}

function renderDashboardClassBars() {
  const container = document.getElementById('dashClassBars');
  if (!container) return;
  container.innerHTML = '';

  if (appClasses.length === 0) {
    container.innerHTML = '<p class="text-muted">No classes created yet.</p>';
    return;
  }

  appClasses.forEach(cls => {
    const classStudents = appStudents.filter(s => s.classId === cls.id);
    const studentIds = classStudents.map(s => s.id);
    const classAttendance = appAttendance.filter(a => studentIds.includes(a.studentId));

    let classRate = 0;
    if (classAttendance.length > 0) {
      const attended = classAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
      classRate = Math.round((attended / classAttendance.length) * 100);
    }

    const row = document.createElement('div');
    row.className = 'class-rate-row';
    row.innerHTML = `
      <div class="class-rate-header">
        <span><strong>${cls.code}</strong> - ${cls.name} (${classStudents.length} students)</span>
        <span>${classRate}% Attendance</span>
      </div>
      <div class="class-rate-track">
        <div class="class-rate-progress" style="width: ${classRate}%;"></div>
      </div>
    `;
    container.appendChild(row);
  });
}

function renderDashboardRecentActivity() {
  const tbody = document.getElementById('dashRecentTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  // Sort descending by date and slice latest 8
  const recent = [...appAttendance].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);

  if (recent.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">No attendance logged yet.</td></tr>';
    return;
  }

  recent.forEach(record => {
    const student = appStudents.find(s => s.id === record.studentId) || { name: 'Unknown', classId: '' };
    const cls = appClasses.find(c => c.id === student.classId) || { code: 'N/A' };

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${record.date}</strong></td>
      <td><code>${record.studentId}</code></td>
      <td>${student.name}</td>
      <td><span class="class-badge">${cls.code}</span></td>
      <td><span class="status-pill status-${record.status.toLowerCase()}">${record.status}</span></td>
      <td><small class="text-muted">${record.timestamp || '08:00 AM'}</small></td>
    `;
    tbody.appendChild(tr);
  });
}

// ==========================================
// 5. Daily Attendance Register Logic
// ==========================================
function renderAttendanceRegister() {
  const datePicker = document.getElementById('attDatePicker');
  const selectedDate = datePicker ? datePicker.value : getTodayString();
  const classFilter = document.getElementById('attClassSelect').value;
  const searchKeyword = document.getElementById('attSearchInput').value.toLowerCase().trim();

  const tbody = document.getElementById('attendanceRegisterBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  // Filter students
  let filteredStudents = appStudents.filter(st => {
    const matchesClass = (classFilter === 'ALL' || st.classId === classFilter);
    const matchesSearch = (!searchKeyword || st.name.toLowerCase().includes(searchKeyword) || st.id.toLowerCase().includes(searchKeyword));
    return matchesClass && matchesSearch;
  });

  document.getElementById('attVisibleCount').textContent = filteredStudents.length;

  if (filteredStudents.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px;">No students match the selected class or search criteria.</td></tr>`;
    return;
  }

  filteredStudents.forEach((student, index) => {
    const cls = appClasses.find(c => c.id === student.classId) || { code: 'N/A' };
    
    // Find if already recorded for this date
    const existing = appAttendance.find(a => a.date === selectedDate && a.studentId === student.id);
    const currentStatus = existing ? existing.status : 'Present'; // Default to Present for ease
    const remarks = existing ? (existing.remarks || '') : '';

    const tr = document.createElement('tr');
    tr.setAttribute('data-student-id', student.id);
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td><code>${student.id}</code></td>
      <td>
        <div class="student-cell">
          <div class="student-avatar">${student.name.charAt(0)}</div>
          <div class="student-meta">
            <strong>${student.name}</strong>
            <span>${student.phone}</span>
          </div>
        </div>
      </td>
      <td><span class="class-badge">${cls.code}</span></td>
      <td style="text-align: center;">
        <div class="status-btn-group" data-student="${student.id}">
          <button type="button" class="status-btn-option ${currentStatus === 'Present' ? 'selected-present' : ''}" data-val="Present">Present</button>
          <button type="button" class="status-btn-option ${currentStatus === 'Absent' ? 'selected-absent' : ''}" data-val="Absent">Absent</button>
          <button type="button" class="status-btn-option ${currentStatus === 'Late' ? 'selected-late' : ''}" data-val="Late">Late</button>
          <button type="button" class="status-btn-option ${currentStatus === 'Excused' ? 'selected-excused' : ''}" data-val="Excused">Excused</button>
        </div>
      </td>
      <td>
        <input type="text" class="form-input att-remark-input" placeholder="Optional notes..." value="${remarks}" style="padding: 5px 8px; font-size: 13px;">
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Attach button selection behavior
  tbody.querySelectorAll('.status-btn-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const group = e.target.closest('.status-btn-group');
      const val = e.target.getAttribute('data-val');
      group.querySelectorAll('.status-btn-option').forEach(b => {
        b.className = 'status-btn-option';
      });
      e.target.classList.add(`selected-${val.toLowerCase()}`);
    });
  });
}

// Batch Quick Selection
function batchMarkRegister(statusVal) {
  const tbody = document.getElementById('attendanceRegisterBody');
  if (!tbody) return;

  tbody.querySelectorAll('.status-btn-group').forEach(group => {
    group.querySelectorAll('.status-btn-option').forEach(b => {
      b.className = 'status-btn-option';
      if (b.getAttribute('data-val') === statusVal) {
        b.classList.add(`selected-${statusVal.toLowerCase()}`);
      }
    });
  });
  showToast(`Marked visible students as ${statusVal}. Click "Save Attendance" to confirm.`, 'info');
}

// Save Daily Attendance
function saveAttendanceRegister() {
  const date = document.getElementById('attDatePicker').value;
  if (!date) {
    showToast('Please select a valid date.', 'error');
    return;
  }

  const tbody = document.getElementById('attendanceRegisterBody');
  const rows = tbody.querySelectorAll('tr[data-student-id]');
  if (rows.length === 0) {
    showToast('No students to save in the current view.', 'error');
    return;
  }

  let updatedCount = 0;
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  rows.forEach(tr => {
    const studentId = tr.getAttribute('data-student-id');
    const group = tr.querySelector('.status-btn-group');
    const activeBtn = group.querySelector('.status-btn-option[class*="selected-"]');
    const status = activeBtn ? activeBtn.getAttribute('data-val') : 'Present';
    const remarks = tr.querySelector('.att-remark-input').value.trim();

    // Prevent duplicate entries for same student and date: find & replace or push
    const recordIndex = appAttendance.findIndex(a => a.date === date && a.studentId === studentId);
    if (recordIndex >= 0) {
      appAttendance[recordIndex].status = status;
      appAttendance[recordIndex].remarks = remarks;
      appAttendance[recordIndex].timestamp = timeStr;
    } else {
      appAttendance.push({
        id: `ATT-${date}-${studentId}`,
        studentId: studentId,
        date: date,
        status: status,
        remarks: remarks,
        timestamp: timeStr
      });
    }
    updatedCount++;
  });

  // Save to localStorage
  AttendanceStorage.saveAttendance(appAttendance);
  showToast(`Attendance successfully saved for ${updatedCount} students on ${date}!`, 'success');

  // Refresh views
  renderDashboard();
}

// ==========================================
// 6. Student Management Logic
// ==========================================
function renderStudentsTable() {
  const tbody = document.getElementById('studentsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const searchKeyword = document.getElementById('studentSearch').value.toLowerCase().trim();
  const classFilter = document.getElementById('studentClassFilter').value;
  const genderFilter = document.getElementById('studentGenderFilter').value;

  const filtered = appStudents.filter(st => {
    const matchesSearch = !searchKeyword || st.name.toLowerCase().includes(searchKeyword) || st.id.toLowerCase().includes(searchKeyword) || st.phone.includes(searchKeyword);
    const matchesClass = (classFilter === 'ALL' || st.classId === classFilter);
    const matchesGender = (genderFilter === 'ALL' || st.gender === genderFilter);
    return matchesSearch && matchesClass && matchesGender;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px;">No students found matching the criteria.</td></tr>`;
    return;
  }

  filtered.forEach(student => {
    const cls = appClasses.find(c => c.id === student.classId) || { code: 'N/A', name: 'Unknown' };

    // Calculate individual student attendance %
    const studentLogs = appAttendance.filter(a => a.studentId === student.id);
    let rate = 100;
    if (studentLogs.length > 0) {
      const attended = studentLogs.filter(a => a.status === 'Present' || a.status === 'Late').length;
      rate = Math.round((attended / studentLogs.length) * 100);
    }

    const rateColor = rate >= 75 ? 'text-success' : 'text-danger';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><code>${student.id}</code></td>
      <td>
        <div class="student-cell">
          <div class="student-avatar">${student.name.charAt(0)}</div>
          <div class="student-meta">
            <strong>${student.name}</strong>
            <span>${student.gender} &bull; ${student.email || 'No email'}</span>
          </div>
        </div>
      </td>
      <td>
        <span class="class-badge">${cls.code}</span>
        <div style="font-size: 12px; color: #64748b; margin-top: 3px;">${cls.name}</div>
      </td>
      <td>
        <div><i class="fa-solid fa-phone" style="font-size: 11px;"></i> ${student.phone}</div>
      </td>
      <td>
        <strong class="${rateColor}">${rate}%</strong>
        <div style="font-size: 11px; color: #64748b;">(${studentLogs.length} total days logged)</div>
      </td>
      <td style="text-align: center;">
        <div class="action-btn-group">
          <button class="btn-icon-action" onclick="openEditStudentModal('${student.id}')" title="Edit Student">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn-icon-action delete-action" onclick="confirmDeleteStudent('${student.id}')" title="Delete Student">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openAddStudentModal() {
  document.getElementById('studentModalTitle').innerHTML = '<i class="fa-solid fa-user-plus"></i> Add New Student';
  document.getElementById('studentForm').reset();
  document.getElementById('studentEditId').value = '';
  document.getElementById('modalStudentId').disabled = false;
  openModal('studentModal');
}

function openEditStudentModal(studentId) {
  const student = appStudents.find(s => s.id === studentId);
  if (!student) return;

  document.getElementById('studentModalTitle').innerHTML = '<i class="fa-solid fa-user-pen"></i> Edit Student Profile';
  document.getElementById('studentEditId').value = student.id;
  document.getElementById('modalStudentId').value = student.id;
  document.getElementById('modalStudentId').disabled = true; // Primary key cannot be changed
  document.getElementById('modalStudentName').value = student.name;
  document.getElementById('modalStudentClass').value = student.classId;
  document.getElementById('modalStudentGender').value = student.gender;
  document.getElementById('modalStudentPhone').value = student.phone;
  document.getElementById('modalStudentEmail').value = student.email || '';

  openModal('studentModal');
}

document.getElementById('studentForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const editId = document.getElementById('studentEditId').value;
  const studentId = document.getElementById('modalStudentId').value.trim();
  const name = document.getElementById('modalStudentName').value.trim();
  const classId = document.getElementById('modalStudentClass').value;
  const gender = document.getElementById('modalStudentGender').value;
  const phone = document.getElementById('modalStudentPhone').value.trim();
  const email = document.getElementById('modalStudentEmail').value.trim();

  if (!studentId || !name || !classId || !phone) {
    showToast('Please fill in all mandatory fields (*)', 'error');
    return;
  }

  if (editId) {
    // Updating existing
    const idx = appStudents.findIndex(s => s.id === editId);
    if (idx !== -1) {
      appStudents[idx] = { ...appStudents[idx], name, classId, gender, phone, email };
      AttendanceStorage.saveStudents(appStudents);
      showToast(`Student ${name} updated successfully!`, 'success');
    }
  } else {
    // Check ID unique
    if (appStudents.some(s => s.id.toLowerCase() === studentId.toLowerCase())) {
      showToast('A student with this ID already exists. Please choose a unique ID.', 'error');
      return;
    }
    appStudents.push({ id: studentId, name, classId, gender, phone, email });
    AttendanceStorage.saveStudents(appStudents);
    showToast(`New student ${name} enrolled successfully!`, 'success');
  }

  closeModal('studentModal');
  renderStudentsTable();
  renderDashboard();
  renderClassesView();
});

function confirmDeleteStudent(studentId) {
  const student = appStudents.find(s => s.id === studentId);
  if (!student) return;

  document.getElementById('confirmModalTitle').textContent = `Delete Student?`;
  document.getElementById('confirmModalMessage').textContent = `Are you sure you want to delete "${student.name}" (${student.id})? All historical attendance records for this student will also be permanently deleted.`;

  pendingConfirmAction = () => {
    appStudents = appStudents.filter(s => s.id !== studentId);
    appAttendance = appAttendance.filter(a => a.studentId !== studentId);
    AttendanceStorage.saveStudents(appStudents);
    AttendanceStorage.saveAttendance(appAttendance);
    showToast(`Student ${student.name} deleted.`, 'info');
    renderStudentsTable();
    renderDashboard();
    renderClassesView();
  };

  openModal('confirmModal');
}

// ==========================================
// 7. Class Management Logic
// ==========================================
function renderClassesView() {
  const grid = document.getElementById('classCardsGrid');
  const tbody = document.getElementById('classesTableBody');
  if (!grid || !tbody) return;

  grid.innerHTML = '';
  tbody.innerHTML = '';

  if (appClasses.length === 0) {
    grid.innerHTML = '<p class="text-muted">No academic classes defined yet.</p>';
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No classes found.</td></tr>';
    return;
  }

  appClasses.forEach(cls => {
    const enrolledStudents = appStudents.filter(s => s.classId === cls.id);
    const count = enrolledStudents.length;

    // Card
    const card = document.createElement('div');
    card.className = 'academic-class-card';
    card.innerHTML = `
      <div>
        <div class="class-card-header">
          <span class="class-badge">${cls.code}</span>
          <div class="action-btn-group">
            <button class="btn-icon-action" onclick="openEditClassModal('${cls.id}')" title="Edit Class">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn-icon-action delete-action" onclick="confirmDeleteClass('${cls.id}')" title="Delete Class">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="class-card-body">
          <h4>${cls.name}</h4>
          <p><i class="fa-solid fa-building-columns"></i> ${cls.dept}<br><i class="fa-solid fa-location-dot"></i> ${cls.room || 'Main Hall'}</p>
        </div>
      </div>
      <div class="class-stats-strip">
        <span>Enrolled Students:</span>
        <strong>${count}</strong>
      </div>
    `;
    grid.appendChild(card);

    // Table Row
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${cls.code}</strong></td>
      <td>${cls.name}</td>
      <td>${cls.dept}</td>
      <td>${cls.room || 'N/A'}</td>
      <td><span class="badge badge-light-blue">${count} Students</span></td>
      <td style="text-align: center;">
        <div class="action-btn-group">
          <button class="btn-icon-action" onclick="openEditClassModal('${cls.id}')">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn-icon-action delete-action" onclick="confirmDeleteClass('${cls.id}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openAddClassModal() {
  document.getElementById('classModalTitle').innerHTML = '<i class="fa-solid fa-chalkboard"></i> Create New Class';
  document.getElementById('classForm').reset();
  document.getElementById('classEditId').value = '';
  openModal('classModal');
}

function openEditClassModal(classId) {
  const cls = appClasses.find(c => c.id === classId);
  if (!cls) return;

  document.getElementById('classModalTitle').innerHTML = '<i class="fa-solid fa-pen"></i> Edit Class Details';
  document.getElementById('classEditId').value = cls.id;
  document.getElementById('modalClassCode').value = cls.code;
  document.getElementById('modalClassName').value = cls.name;
  document.getElementById('modalClassDept').value = cls.dept;
  document.getElementById('modalClassRoom').value = cls.room || '';

  openModal('classModal');
}

document.getElementById('classForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const editId = document.getElementById('classEditId').value;
  const code = document.getElementById('modalClassCode').value.trim().toUpperCase();
  const name = document.getElementById('modalClassName').value.trim();
  const dept = document.getElementById('modalClassDept').value.trim();
  const room = document.getElementById('modalClassRoom').value.trim();

  if (!code || !name || !dept) {
    showToast('Please fill all required class fields.', 'error');
    return;
  }

  if (editId) {
    const idx = appClasses.findIndex(c => c.id === editId);
    if (idx !== -1) {
      appClasses[idx] = { ...appClasses[idx], code, name, dept, room };
      AttendanceStorage.saveClasses(appClasses);
      showToast(`Class ${code} updated!`, 'success');
    }
  } else {
    const newId = `CLS-${Date.now().toString().slice(-4)}`;
    appClasses.push({ id: newId, code, name, dept, room });
    AttendanceStorage.saveClasses(appClasses);
    showToast(`New class ${code} created successfully!`, 'success');
  }

  closeModal('classModal');
  populateAllClassSelects();
  renderClassesView();
  renderDashboard();
});

function confirmDeleteClass(classId) {
  const cls = appClasses.find(c => c.id === classId);
  if (!cls) return;

  const enrolledCount = appStudents.filter(s => s.classId === classId).length;
  if (enrolledCount > 0) {
    showToast(`Cannot delete class "${cls.code}": ${enrolledCount} students are currently enrolled. Please reassign them first.`, 'error');
    return;
  }

  document.getElementById('confirmModalTitle').textContent = `Delete Class "${cls.code}"?`;
  document.getElementById('confirmModalMessage').textContent = `Are you sure you want to remove this academic class?`;

  pendingConfirmAction = () => {
    appClasses = appClasses.filter(c => c.id !== classId);
    AttendanceStorage.saveClasses(appClasses);
    populateAllClassSelects();
    showToast(`Class deleted.`, 'info');
    renderClassesView();
    renderDashboard();
  };

  openModal('confirmModal');
}

// ==========================================
// 8. Reports & Analytics Logic
// ==========================================
function renderReportsView() {
  const startDate = document.getElementById('repStartDate').value;
  const endDate = document.getElementById('repEndDate').value;
  const classFilter = document.getElementById('repClassSelect').value;
  const statusFilter = document.getElementById('repStatusSelect').value;

  const tbody = document.getElementById('reportTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  // Filter records
  let filtered = appAttendance.filter(record => {
    let matchesDate = true;
    if (startDate && record.date < startDate) matchesDate = false;
    if (endDate && record.date > endDate) matchesDate = false;

    let matchesClass = true;
    if (classFilter !== 'ALL') {
      const student = appStudents.find(s => s.id === record.studentId);
      matchesClass = student && student.classId === classFilter;
    }

    let matchesStatus = true;
    if (statusFilter !== 'ALL') {
      matchesStatus = record.status === statusFilter;
    }

    return matchesDate && matchesClass && matchesStatus;
  });

  // Sort by date descending
  filtered.sort((a, b) => b.date.localeCompare(a.date));

  // Compute stats
  const total = filtered.length;
  const present = filtered.filter(r => r.status === 'Present').length;
  const absent = filtered.filter(r => r.status === 'Absent').length;
  const late = filtered.filter(r => r.status === 'Late').length;
  const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  document.getElementById('repStatTotalRecords').textContent = total;
  document.getElementById('repStatPresent').textContent = present;
  document.getElementById('repStatAbsent').textContent = absent;
  document.getElementById('repStatLate').textContent = late;
  document.getElementById('repStatPercent').textContent = `${rate}%`;

  // Print Header Date
  const printDateEl = document.getElementById('printGeneratedDate');
  if (printDateEl) {
    printDateEl.textContent = `Generated on: ${new Date().toLocaleString()} | Filter: ${classFilter} | Date Range: ${startDate || 'All'} to ${endDate || 'Today'}`;
  }

  // Populate Table
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 24px;">No records found matching the specified report filters.</td></tr>';
  } else {
    filtered.forEach(record => {
      const student = appStudents.find(s => s.id === record.studentId) || { name: 'Unknown', classId: '' };
      const cls = appClasses.find(c => c.id === student.classId) || { code: 'N/A' };

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${record.date}</strong></td>
        <td><code>${record.studentId}</code></td>
        <td>${student.name}</td>
        <td><span class="class-badge">${cls.code}</span></td>
        <td><span class="status-pill status-${record.status.toLowerCase()}">${record.status}</span></td>
        <td>${record.remarks || '<span class="text-muted">-</span>'}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Compute Defaulters (< 75% attendance) and Frequent Latecomers
  renderDefaulterAlerts();
}

function renderDefaulterAlerts() {
  const defaulterBox = document.getElementById('defaulterListContainer');
  const lateBox = document.getElementById('latecomersListContainer');
  if (!defaulterBox || !lateBox) return;

  defaulterBox.innerHTML = '';
  lateBox.innerHTML = '';

  const defaulters = [];
  const latecomers = [];

  appStudents.forEach(st => {
    const records = appAttendance.filter(a => a.studentId === st.id);
    if (records.length === 0) return;

    const attended = records.filter(a => a.status === 'Present' || a.status === 'Late').length;
    const rate = Math.round((attended / records.length) * 100);

    const lates = records.filter(a => a.status === 'Late').length;

    if (rate < 75) {
      defaulters.push({ student: st, rate: rate, total: records.length, attended: attended });
    }

    if (lates >= 2) {
      latecomers.push({ student: st, lateCount: lates });
    }
  });

  if (defaulters.length === 0) {
    defaulterBox.innerHTML = '<span class="text-success"><i class="fa-solid fa-check"></i> Great job! No students below 75% attendance.</span>';
  } else {
    defaulters.forEach(item => {
      const cls = appClasses.find(c => c.id === item.student.classId) || { code: 'N/A' };
      const div = document.createElement('div');
      div.className = 'defaulter-item';
      div.innerHTML = `
        <div>
          <strong>${item.student.name}</strong> <code>(${item.student.id})</code> - <span class="class-badge">${cls.code}</span>
        </div>
        <span class="text-danger"><strong>${item.rate}%</strong> (${item.attended}/${item.total} days)</span>
      `;
      defaulterBox.appendChild(div);
    });
  }

  if (latecomers.length === 0) {
    lateBox.innerHTML = '<span class="text-muted"><i class="fa-solid fa-check"></i> No students with frequent tardiness issues.</span>';
  } else {
    latecomers.forEach(item => {
      const cls = appClasses.find(c => c.id === item.student.classId) || { code: 'N/A' };
      const div = document.createElement('div');
      div.className = 'defaulter-item';
      div.innerHTML = `
        <div>
          <strong>${item.student.name}</strong> <code>(${item.student.id})</code> - <span class="class-badge">${cls.code}</span>
        </div>
        <span class="text-warning"><strong>${item.lateCount} Days Late</strong></span>
      `;
      lateBox.appendChild(div);
    });
  }
}

// Export to CSV Function
function exportAttendanceToCSV() {
  if (appAttendance.length === 0) {
    showToast('No records available to export.', 'error');
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Date,StudentID,StudentName,ClassCode,AttendanceStatus,Remarks,TimeRecorded\n";

  appAttendance.forEach(rec => {
    const student = appStudents.find(s => s.id === rec.studentId) || { name: 'Unknown', classId: '' };
    const cls = appClasses.find(c => c.id === student.classId) || { code: 'N/A' };
    const cleanRemarks = (rec.remarks || '').replace(/,/g, ' ');

    csvContent += `${rec.date},"${rec.studentId}","${student.name}","${cls.code}","${rec.status}","${cleanRemarks}","${rec.timestamp || ''}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `EduTrack_Attendance_Report_${getTodayString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Attendance report exported to CSV successfully!', 'success');
}

// ==========================================
// 9. Modal & Toast Notification Helpers
// ==========================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('show');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('show');
}

// Global modal backdrop close
window.onclick = function(event) {
  if (event.target.classList.contains('modal-backdrop')) {
    event.target.classList.remove('show');
  }
};

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let icon = 'info-circle';
  if (type === 'success') icon = 'check-circle';
  if (type === 'error') icon = 'circle-exclamation';

  toast.innerHTML = `
    <i class="fa-solid fa-${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Setup Event Listeners for Filters
function setupLiveEventListeners() {
  // Attendance page filter events
  const attDatePicker = document.getElementById('attDatePicker');
  if (attDatePicker) attDatePicker.addEventListener('change', renderAttendanceRegister);

  const attClassSelect = document.getElementById('attClassSelect');
  if (attClassSelect) attClassSelect.addEventListener('change', renderAttendanceRegister);

  const attSearchInput = document.getElementById('attSearchInput');
  if (attSearchInput) attSearchInput.addEventListener('input', renderAttendanceRegister);

  const btnSaveAtt = document.getElementById('btnSaveAttendance');
  if (btnSaveAtt) btnSaveAtt.addEventListener('click', saveAttendanceRegister);

  const btnBatchPresent = document.getElementById('btnBatchPresent');
  if (btnBatchPresent) btnBatchPresent.addEventListener('click', () => batchMarkRegister('Present'));

  const btnBatchAbsent = document.getElementById('btnBatchAbsent');
  if (btnBatchAbsent) btnBatchAbsent.addEventListener('click', () => batchMarkRegister('Absent'));

  // Students page filter events
  const studentSearch = document.getElementById('studentSearch');
  if (studentSearch) studentSearch.addEventListener('input', renderStudentsTable);

  const studentClassFilter = document.getElementById('studentClassFilter');
  if (studentClassFilter) studentClassFilter.addEventListener('change', renderStudentsTable);

  const studentGenderFilter = document.getElementById('studentGenderFilter');
  if (studentGenderFilter) studentGenderFilter.addEventListener('change', renderStudentsTable);

  // Reports page filter events
  const btnApplyReport = document.getElementById('btnApplyReportFilter');
  if (btnApplyReport) btnApplyReport.addEventListener('click', renderReportsView);

  const btnExportCSV = document.getElementById('btnExportCSV');
  if (btnExportCSV) btnExportCSV.addEventListener('click', exportAttendanceToCSV);

  // Confirmation modal accept button
  const btnConfirmAction = document.getElementById('btnConfirmAction');
  if (btnConfirmAction) {
    btnConfirmAction.addEventListener('click', () => {
      if (typeof pendingConfirmAction === 'function') {
        pendingConfirmAction();
        pendingConfirmAction = null;
      }
      closeModal('confirmModal');
    });
  }
}