/* ═══════════════════════════════════════════════════════════
   REQUIREMENT CLARIFIER AI — script.js
   All logic runs client-side. No backend required.
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ── LocalStorage key ─────────────────────────────────────── */
const LS_KEY = 'reqclarifier_lastinput';

/* ── Char counter ─────────────────────────────────────────── */
const textarea = document.getElementById('projectIdea');
const charCount = document.getElementById('charCount');

textarea.addEventListener('input', () => {
  charCount.textContent = `${textarea.value.length} / 800`;
});

/* ── Restore last session input ───────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY));
    if (!saved) return;
    if (saved.idea)    textarea.value = saved.idea;
    if (saved.type)    document.getElementById('projectType').value  = saved.type;
    if (saved.industry)document.getElementById('industry').value     = saved.industry;
    if (saved.users)   document.getElementById('expectedUsers').value = saved.users;
    if (saved.hints)   saved.hints.forEach(h => {
      document.querySelectorAll('#featureHints input').forEach(cb => {
        if (cb.value === h) cb.checked = true;
      });
    });
    charCount.textContent = `${textarea.value.length} / 800`;
  } catch(_) {}
});

/* ── Gather selected feature hints ───────────────────────── */
function getHints() {
  return [...document.querySelectorAll('#featureHints input:checked')]
    .map(cb => cb.value);
}

/* ══════════════════════════════════════════════════════════════
   MAIN GENERATE FUNCTION
   ══════════════════════════════════════════════════════════════ */
function generateRequirements() {
  const idea     = textarea.value.trim();
  const type     = document.getElementById('projectType').value;
  const industry = document.getElementById('industry').value;
  const rawUsers = document.getElementById('expectedUsers').value.trim();
  const hints    = getHints();
  const valMsg   = document.getElementById('validationMsg');

  /* Validate */
  if (!idea || !type || !industry) {
    valMsg.style.display = 'flex';
    textarea.focus();
    return;
  }
  valMsg.style.display = 'none';

  /* Save to LocalStorage */
  localStorage.setItem(LS_KEY, JSON.stringify({ idea, type, industry, users: rawUsers, hints }));

  /* Show loader */
  const btn      = document.getElementById('generateBtn');
  const btnText  = btn.querySelector('.btn-text');
  const btnLoader= btn.querySelector('.btn-loader');
  btn.disabled   = true;
  btnText.style.display  = 'none';
  btnLoader.style.display= 'flex';

  /* Simulate analyst "thinking" time (UX feel) */
  setTimeout(() => {
    try {
      buildOutput({ idea, type, industry, rawUsers, hints });
    } finally {
      btn.disabled  = false;
      btnText.style.display   = 'flex';
      btnLoader.style.display = 'none';
    }
  }, 1400);
}

/* ══════════════════════════════════════════════════════════════
   KNOWLEDGE BASE — domain-aware generation
   ══════════════════════════════════════════════════════════════ */

/* Extract a clean project name from the idea text */
function extractProjectName(idea) {
  const lower = idea.toLowerCase();
  const patterns = [
    /(?:called|named|titled)\s+["']?([A-Za-z0-9 ]+)["']?/i,
    /^([A-Za-z0-9 ]+?)(?:\s+(?:app|system|platform|tool|website|portal|software))/i,
  ];
  for (const p of patterns) {
    const m = idea.match(p);
    if (m) return m[1].trim();
  }
  // Fallback: first 3–5 words
  const words = idea.split(/\s+/).slice(0, 4).join(' ');
  return words.length > 3 ? words : 'the proposed system';
}

/* ── Keyword detector helper ──────────────────────────────── */
function has(idea, ...words) {
  const l = idea.toLowerCase();
  return words.some(w => l.includes(w));
}

/* ─────────────────────────────────────────────────────────────
   USERS builder
   ───────────────────────────────────────────────────────────── */
function buildUsers(idea, industry, rawUsers, hints) {
  /* If user specified roles, parse them */
  if (rawUsers) {
    const parsed = rawUsers.split(',').map(s => s.trim()).filter(Boolean);
    return parsed.map((r, i) => ({
      role: r,
      type: i === 0 ? 'admin' : 'user',
      desc: inferUserDesc(r, industry),
    }));
  }

  /* Industry defaults */
  const base = {
    Education:    [
      { role: 'Administrator',  type: 'admin',    desc: 'Manages platform settings, users, and institutional data.' },
      { role: 'Teacher / Instructor', type: 'user', desc: 'Creates courses, assignments, and monitors student progress.' },
      { role: 'Student',        type: 'user',     desc: 'Enrols in courses, submits assignments, and tracks learning progress.' },
      { role: 'Parent / Guardian', type: 'external', desc: 'Views performance reports and communicates with instructors.' },
    ],
    'E-commerce': [
      { role: 'Super Admin',    type: 'admin',    desc: 'Manages the entire marketplace, vendors, and platform configuration.' },
      { role: 'Vendor / Seller',type: 'user',     desc: 'Lists products, manages inventory, and fulfils orders.' },
      { role: 'Customer',       type: 'user',     desc: 'Browses products, places orders, and manages their account.' },
      { role: 'Delivery Agent', type: 'system',   desc: 'Handles order dispatching and provides real-time tracking updates.' },
    ],
    Finance: [
      { role: 'System Administrator', type: 'admin', desc: 'Configures rules, monitors compliance, and manages accounts.' },
      { role: 'Finance Manager', type: 'user',    desc: 'Oversees transactions, approvals, and financial reporting.' },
      { role: 'End User / Client', type: 'user',  desc: 'Performs financial transactions and accesses personal accounts.' },
      { role: 'Auditor',        type: 'external', desc: 'Reviews audit trails and generates compliance reports.' },
    ],
    Healthcare: [
      { role: 'Hospital Administrator', type: 'admin', desc: 'Manages staff, departments, and system-wide configurations.' },
      { role: 'Doctor / Physician', type: 'user',  desc: 'Records prescriptions, diagnoses, and patient consultations.' },
      { role: 'Nurse / Paramedic', type: 'user',   desc: 'Updates patient vitals, manages appointments, and assists doctors.' },
      { role: 'Patient',        type: 'user',     desc: 'Books appointments, accesses medical history, and views reports.' },
      { role: 'Pharmacist',     type: 'external', desc: 'Dispenses medication based on digital prescriptions.' },
    ],
    Logistics: [
      { role: 'Operations Manager', type: 'admin', desc: 'Oversees fleet, routes, and logistics coordination.' },
      { role: 'Driver / Courier',   type: 'user',  desc: 'Accepts delivery tasks and updates shipment status.' },
      { role: 'Client / Sender',    type: 'user',  desc: 'Books shipments, tracks parcels, and raises support tickets.' },
    ],
    'HR / Recruitment': [
      { role: 'HR Admin',       type: 'admin',    desc: 'Manages job postings, candidate pipelines, and HR policies.' },
      { role: 'Recruiter',      type: 'user',     desc: 'Reviews applications, schedules interviews, and provides feedback.' },
      { role: 'Job Applicant',  type: 'user',     desc: 'Applies for roles, tracks application status, and uploads documents.' },
      { role: 'Hiring Manager', type: 'user',     desc: 'Reviews shortlisted candidates and approves final hiring decisions.' },
    ],
    'Real Estate': [
      { role: 'Platform Admin', type: 'admin',    desc: 'Manages listings, user accounts, and platform policies.' },
      { role: 'Property Agent', type: 'user',     desc: 'Lists properties, schedules viewings, and negotiates deals.' },
      { role: 'Buyer / Tenant', type: 'user',     desc: 'Searches listings, books viewings, and communicates with agents.' },
    ],
    Other: [
      { role: 'Administrator',  type: 'admin',    desc: 'Has full system access; manages users, roles, and configurations.' },
      { role: 'Manager',        type: 'user',     desc: 'Oversees operations, approves workflows, and views reports.' },
      { role: 'Regular User',   type: 'user',     desc: 'Performs primary domain-specific tasks within their permissions.' },
      { role: 'Guest / Viewer', type: 'external', desc: 'Has read-only access to public-facing content.' },
    ],
  };

  let users = (base[industry] || base.Other).slice();

  /* Contextual additions based on idea keywords */
  if (has(idea, 'bug', 'issue', 'tracker', 'ticket'))
    users.push({ role: 'QA Engineer', type: 'user', desc: 'Logs defects, verifies fixes, and manages test cases.' });
  if (has(idea, 'delivery', 'shipping', 'courier'))
    users.push({ role: 'Delivery Agent', type: 'system', desc: 'Handles last-mile delivery and updates tracking status.' });
  if (hints.includes('Payment Integration'))
    users.push({ role: 'Payment Gateway (System)', type: 'system', desc: 'Processes payment transactions via integrated third-party API.' });

  return users;
}

function inferUserDesc(role, industry) {
  const r = role.toLowerCase();
  if (r.includes('admin')) return 'Has full system access, manages configurations, and oversees all operations.';
  if (r.includes('manager')) return 'Oversees workflows, approves requests, and monitors performance metrics.';
  if (r.includes('user') || r.includes('member')) return 'Performs core domain tasks within their allocated permissions.';
  if (r.includes('guest') || r.includes('viewer')) return 'Has read-only or limited access to public-facing system content.';
  if (r.includes('analyst') || r.includes('auditor')) return 'Reviews data, generates reports, and ensures compliance.';
  return `Performs ${industry.toLowerCase()}-specific tasks relevant to their role.`;
}

/* ─────────────────────────────────────────────────────────────
   MODULES builder
   ───────────────────────────────────────────────────────────── */
function buildModules(idea, industry, type, hints) {
  const coreModules = [
    { name: 'Authentication & Access Control', desc: 'User registration, login, role-based access, and session management.' },
    { name: 'Dashboard & Analytics', desc: 'Centralised overview with KPIs, charts, and activity summaries.' },
  ];

  const industryModules = {
    Education: [
      { name: 'Course Management', desc: 'Create, publish, and manage courses, syllabi, and learning materials.' },
      { name: 'Assignment & Grading', desc: 'Submission portal with automated grading and feedback tools.' },
      { name: 'Student Progress Tracker', desc: 'Individual performance analytics and learning outcome reporting.' },
      { name: 'Attendance Management', desc: 'Automated attendance recording and notification system.' },
    ],
    'E-commerce': [
      { name: 'Product Catalogue',  desc: 'CRUD operations for products with categories, variants, and media.' },
      { name: 'Cart & Checkout',    desc: 'Shopping cart, coupon engine, and multi-step checkout flow.' },
      { name: 'Order Management',   desc: 'Order lifecycle from placement to delivery with status tracking.' },
      { name: 'Inventory Management', desc: 'Real-time stock control with reorder alerts and supplier management.' },
    ],
    Finance: [
      { name: 'Account Management', desc: 'Manage user accounts, balances, and transaction limits.' },
      { name: 'Transaction Processing', desc: 'Secure fund transfers, deposits, withdrawals, and reversals.' },
      { name: 'Budget & Expense Tracker', desc: 'Category-wise expense logging with visual budget comparisons.' },
      { name: 'Compliance & Audit', desc: 'Regulatory compliance checks and tamper-proof audit trail.' },
    ],
    Healthcare: [
      { name: 'Patient Management',    desc: 'Registration, demographics, and complete medical history records.' },
      { name: 'Appointment Scheduling', desc: 'Slot management, calendar integration, and reminder notifications.' },
      { name: 'Electronic Health Records (EHR)', desc: 'Structured storage of diagnoses, prescriptions, and lab reports.' },
      { name: 'Billing & Insurance',   desc: 'Generate invoices, process insurance claims, and track payments.' },
    ],
    Logistics: [
      { name: 'Shipment Management',  desc: 'Create, track, and manage delivery orders end-to-end.' },
      { name: 'Route Optimisation',   desc: 'Algorithm-driven route planning for fleet efficiency.' },
      { name: 'Warehouse Management', desc: 'Inventory receiving, storage zones, and dispatch management.' },
    ],
    'HR / Recruitment': [
      { name: 'Job Posting Management', desc: 'Create and publish job listings with requirements and deadlines.' },
      { name: 'Applicant Tracking',    desc: 'Pipeline view of candidates from application to offer.' },
      { name: 'Interview Scheduling',  desc: 'Calendar-based interview booking with automated reminders.' },
      { name: 'Onboarding Module',     desc: 'Digital document collection and employee onboarding workflows.' },
    ],
    'Real Estate': [
      { name: 'Property Listing',   desc: 'Add, update, and manage property listings with media galleries.' },
      { name: 'Search & Discovery', desc: 'Advanced search with filters for location, price, and amenities.' },
      { name: 'Viewing Scheduler',  desc: 'Book and manage property viewing appointments.' },
      { name: 'Deal Management',    desc: 'Track negotiation stages, documents, and closing workflows.' },
    ],
    Other: [
      { name: 'Resource Management', desc: 'Manage core domain resources, assignments, and workflows.' },
      { name: 'Task & Workflow Engine', desc: 'Create, assign, and track tasks with status and priority management.' },
      { name: 'Document Management', desc: 'Secure upload, versioning, and retrieval of system documents.' },
    ],
  };

  let modules = [
    ...coreModules,
    ...(industryModules[industry] || industryModules.Other),
  ];

  /* Keyword-driven additions */
  if (has(idea, 'bug', 'issue', 'defect', 'ticket'))
    modules.push({ name: 'Bug & Issue Tracker', desc: 'Log, prioritise, assign, and resolve software defects with status history.' });
  if (has(idea, 'team', 'collaborat', 'member'))
    modules.push({ name: 'Team Collaboration', desc: 'Comments, @mentions, and real-time activity feeds per project.' });
  if (has(idea, 'report', 'analytics', 'stat', 'chart'))
    modules.push({ name: 'Reports & Analytics', desc: 'Generate PDF/CSV reports with configurable charts and date filters.' });

  /* Hint-driven additions */
  if (hints.includes('Notifications & Alerts'))
    modules.push({ name: 'Notification Centre', desc: 'In-app, email, and push notifications with preference controls.' });
  if (hints.includes('File Upload & Management'))
    modules.push({ name: 'File & Media Manager', desc: 'Secure file uploads with type validation, previews, and access control.' });
  if (hints.includes('Messaging / Chat'))
    modules.push({ name: 'Messaging & Chat',    desc: 'Real-time one-to-one and group messaging with read receipts.' });
  if (hints.includes('Payment Integration'))
    modules.push({ name: 'Payment Gateway', desc: 'Integrate with Stripe/Razorpay for secure transaction processing.' });
  if (hints.includes('Audit Logs'))
    modules.push({ name: 'Audit & Activity Logs', desc: 'Immutable log of all user actions with timestamps and IP records.' });

  /* Add settings at end */
  modules.push({ name: 'Settings & Administration', desc: 'System-wide configurations, role management, and profile settings.' });

  return modules;
}

/* ─────────────────────────────────────────────────────────────
   FEATURES builder
   ───────────────────────────────────────────────────────────── */
function buildFeatures(modules, hints, idea) {
  const featureMap = {
    'Authentication & Access Control': [
      'Email & password registration with validation',
      'JWT / session-based secure login',
      'Role-based access control (RBAC)',
      'Password reset via email OTP',
      'Account lock after failed attempts',
    ],
    'Dashboard & Analytics': [
      'Real-time KPI summary cards',
      'Interactive charts (bar, pie, line)',
      'Recent activity feed',
      'Quick-action shortcuts',
      'Date-range filter for all widgets',
    ],
    'Course Management': [
      'Create and publish courses with metadata',
      'Module-wise content organisation',
      'Multimedia attachment support',
      'Course enrolment & waitlist management',
      'Publish / draft / archive states',
    ],
    'Assignment & Grading': [
      'Assignment creation with deadline and rubric',
      'File submission portal for students',
      'Marks entry with feedback comments',
      'Grade book with export to CSV',
      'Plagiarism flag trigger',
    ],
    'Product Catalogue': [
      'Add / edit / delete product listings',
      'Variant support (size, colour, SKU)',
      'Bulk CSV import/export',
      'Product media gallery (images/video)',
      'Category and tag management',
    ],
    'Cart & Checkout': [
      'Persistent shopping cart across sessions',
      'Coupon and discount code engine',
      'Address management with map pin',
      'Multi-step checkout with order summary',
      'Guest checkout support',
    ],
    'Order Management': [
      'Order placement with confirmation email',
      'Status pipeline: Placed → Packed → Shipped → Delivered',
      'Return & refund request workflow',
      'Invoice generation and download',
      'Customer order history page',
    ],
    'Patient Management': [
      'New patient registration with demographics',
      'Medical history and allergy records',
      'Document uploads (X-rays, lab reports)',
      'Patient search by ID, name, or contact',
      'Consent form digital signature',
    ],
    'Appointment Scheduling': [
      'Doctor availability slot configuration',
      'Online appointment booking by patient',
      'Automated SMS / email reminders',
      'Cancellation and rescheduling workflow',
      'Walk-in queue management',
    ],
    'Bug & Issue Tracker': [
      'Create bug reports with severity and priority',
      'Assign bugs to team members',
      'Status pipeline: Open → In Progress → Review → Closed',
      'Attach screenshots and log files',
      'Comment thread per issue',
    ],
    'Team Collaboration': [
      'Project workspace with member roles',
      'Real-time activity feed per project',
      '@mention notifications in comments',
      'Shared task board (Kanban-style)',
      'Project milestone tracking',
    ],
    'Settings & Administration': [
      'User account management (CRUD)',
      'Role and permission configuration',
      'System branding and theme settings',
      'Email/SMTP configuration panel',
      'Data backup and restore options',
    ],
    'Notification Centre': [
      'In-app notification bell with count badge',
      'Email digest preferences (instant / daily)',
      'Mark all as read functionality',
      'Notification type filter',
      'Push notification support (mobile)',
    ],
    'Payment Gateway': [
      'Integration with Stripe / Razorpay API',
      'Secure card tokenisation',
      'Payment status webhooks',
      'Invoice and receipt generation',
      'Refund processing workflow',
    ],
    'File & Media Manager': [
      'Drag-and-drop file upload',
      'File type and size validation',
      'Thumbnail preview for images',
      'Secure access-controlled download links',
      'Folder / category organisation',
    ],
    'Reports & Analytics': [
      'Date-range report generation',
      'PDF and CSV export',
      'Graphical charts (Chart.js / D3)',
      'Role-filtered report visibility',
      'Scheduled email report delivery',
    ],
    'Audit & Activity Logs': [
      'Immutable action log with timestamp',
      'Filter by user, action type, and date',
      'IP address and device tracking',
      'Export logs to CSV',
      'Retention policy configuration',
    ],
  };

  const result = [];

  modules.forEach(mod => {
    if (featureMap[mod.name]) {
      result.push({ module: mod.name, features: featureMap[mod.name] });
    } else {
      /* Generic features for unrecognised module names */
      result.push({
        module: mod.name,
        features: [
          `Create, view, edit, and delete ${mod.name.toLowerCase()} records`,
          'Search and filter with pagination',
          'Status management and workflow transitions',
          'Export data to CSV / PDF',
          'Detailed audit trail for all changes',
        ],
      });
    }
  });

  return result;
}

/* ─────────────────────────────────────────────────────────────
   DATABASE SCHEMA builder
   ───────────────────────────────────────────────────────────── */
function buildSchema(industry, users, hints, idea) {
  /* Core tables always present */
  const schema = [
    {
      table: 'users',
      desc: 'Central user registry for all system actors',
      columns: [
        { name: 'user_id',       type: 'INT',          key: 'PK', notes: 'Auto-increment primary key' },
        { name: 'full_name',     type: 'VARCHAR(120)',  key: '',   notes: 'Full display name' },
        { name: 'email',         type: 'VARCHAR(180)',  key: 'UQ', notes: 'Unique login email' },
        { name: 'password_hash', type: 'VARCHAR(255)',  key: '',   notes: 'Bcrypt hashed password' },
        { name: 'role',          type: 'ENUM(...)',     key: '',   notes: `Values: ${users.map(u=>u.role).join(', ')}` },
        { name: 'is_active',     type: 'TINYINT(1)',    key: '',   notes: 'Soft-delete flag' },
        { name: 'created_at',    type: 'DATETIME',      key: '',   notes: 'DEFAULT CURRENT_TIMESTAMP' },
        { name: 'updated_at',    type: 'DATETIME',      key: '',   notes: 'ON UPDATE CURRENT_TIMESTAMP' },
      ],
    },
    {
      table: 'roles_permissions',
      desc: 'Maps roles to granular system permissions',
      columns: [
        { name: 'id',         type: 'INT',         key: 'PK', notes: '' },
        { name: 'role_name',  type: 'VARCHAR(80)',  key: '',   notes: 'Matches user.role values' },
        { name: 'permission', type: 'VARCHAR(100)', key: '',   notes: 'e.g. view_reports, edit_users' },
        { name: 'created_at', type: 'DATETIME',     key: '',   notes: '' },
      ],
    },
  ];

  /* Industry-specific tables */
  const industryTables = {
    Education: [
      {
        table: 'courses',
        desc: 'Stores all course metadata',
        columns: [
          { name: 'course_id',    type: 'INT',          key: 'PK', notes: '' },
          { name: 'title',        type: 'VARCHAR(200)',  key: '',   notes: '' },
          { name: 'description',  type: 'TEXT',          key: '',   notes: '' },
          { name: 'instructor_id',type: 'INT',           key: 'FK', notes: 'FK → users.user_id' },
          { name: 'status',       type: "ENUM('draft','published','archived')", key: '', notes: '' },
          { name: 'created_at',   type: 'DATETIME',      key: '',   notes: '' },
        ],
      },
      {
        table: 'enrollments',
        desc: 'Student-course enrolment mapping',
        columns: [
          { name: 'enrollment_id',type: 'INT',      key: 'PK', notes: '' },
          { name: 'student_id',   type: 'INT',      key: 'FK', notes: 'FK → users.user_id' },
          { name: 'course_id',    type: 'INT',      key: 'FK', notes: 'FK → courses.course_id' },
          { name: 'enrolled_at',  type: 'DATETIME', key: '',   notes: '' },
          { name: 'grade',        type: 'DECIMAL(5,2)', key: '', notes: 'NULL until graded' },
        ],
      },
      {
        table: 'assignments',
        desc: 'Assignments linked to courses',
        columns: [
          { name: 'assignment_id',type: 'INT',         key: 'PK', notes: '' },
          { name: 'course_id',    type: 'INT',         key: 'FK', notes: 'FK → courses.course_id' },
          { name: 'title',        type: 'VARCHAR(200)', key: '',  notes: '' },
          { name: 'deadline',     type: 'DATETIME',     key: '',  notes: '' },
          { name: 'max_marks',    type: 'INT',          key: '',  notes: '' },
        ],
      },
    ],
    'E-commerce': [
      {
        table: 'products',
        desc: 'Product catalogue',
        columns: [
          { name: 'product_id',  type: 'INT',           key: 'PK', notes: '' },
          { name: 'vendor_id',   type: 'INT',           key: 'FK', notes: 'FK → users.user_id' },
          { name: 'name',        type: 'VARCHAR(200)',   key: '',   notes: '' },
          { name: 'description', type: 'TEXT',           key: '',   notes: '' },
          { name: 'price',       type: 'DECIMAL(10,2)', key: '',   notes: '' },
          { name: 'stock_qty',   type: 'INT',           key: '',   notes: '' },
          { name: 'category_id', type: 'INT',           key: 'FK', notes: 'FK → categories.category_id' },
          { name: 'status',      type: "ENUM('active','inactive')", key: '', notes: '' },
        ],
      },
      {
        table: 'orders',
        desc: 'Customer purchase orders',
        columns: [
          { name: 'order_id',      type: 'INT',           key: 'PK', notes: '' },
          { name: 'customer_id',   type: 'INT',           key: 'FK', notes: 'FK → users.user_id' },
          { name: 'total_amount',  type: 'DECIMAL(10,2)', key: '',   notes: '' },
          { name: 'status',        type: "ENUM('placed','packed','shipped','delivered','cancelled')", key: '', notes: '' },
          { name: 'payment_status',type: "ENUM('pending','paid','refunded')", key: '', notes: '' },
          { name: 'placed_at',     type: 'DATETIME',      key: '',   notes: '' },
        ],
      },
      {
        table: 'order_items',
        desc: 'Line items within an order',
        columns: [
          { name: 'item_id',    type: 'INT',           key: 'PK', notes: '' },
          { name: 'order_id',   type: 'INT',           key: 'FK', notes: 'FK → orders.order_id' },
          { name: 'product_id', type: 'INT',           key: 'FK', notes: 'FK → products.product_id' },
          { name: 'quantity',   type: 'INT',           key: '',   notes: '' },
          { name: 'unit_price', type: 'DECIMAL(10,2)', key: '',   notes: 'Price at time of purchase' },
        ],
      },
    ],
    Finance: [
      {
        table: 'accounts',
        desc: 'Financial accounts per user',
        columns: [
          { name: 'account_id',  type: 'INT',           key: 'PK', notes: '' },
          { name: 'user_id',     type: 'INT',           key: 'FK', notes: 'FK → users.user_id' },
          { name: 'account_no',  type: 'VARCHAR(20)',   key: 'UQ', notes: 'Unique account number' },
          { name: 'balance',     type: 'DECIMAL(15,2)', key: '',   notes: '' },
          { name: 'account_type',type: "ENUM('savings','current','wallet')", key: '', notes: '' },
          { name: 'status',      type: "ENUM('active','frozen','closed')", key: '', notes: '' },
        ],
      },
      {
        table: 'transactions',
        desc: 'All monetary movements',
        columns: [
          { name: 'txn_id',      type: 'INT',           key: 'PK', notes: '' },
          { name: 'from_account',type: 'INT',           key: 'FK', notes: 'FK → accounts.account_id' },
          { name: 'to_account',  type: 'INT',           key: 'FK', notes: 'FK → accounts.account_id' },
          { name: 'amount',      type: 'DECIMAL(15,2)', key: '',   notes: '' },
          { name: 'type',        type: "ENUM('credit','debit','transfer')", key: '', notes: '' },
          { name: 'status',      type: "ENUM('pending','completed','failed')", key: '', notes: '' },
          { name: 'txn_ref',     type: 'VARCHAR(64)',   key: 'UQ', notes: 'Unique reference ID' },
          { name: 'created_at',  type: 'DATETIME',      key: '',   notes: '' },
        ],
      },
    ],
    Healthcare: [
      {
        table: 'patients',
        desc: 'Patient demographic and medical data',
        columns: [
          { name: 'patient_id',  type: 'INT',         key: 'PK', notes: '' },
          { name: 'user_id',     type: 'INT',         key: 'FK', notes: 'FK → users.user_id' },
          { name: 'dob',         type: 'DATE',        key: '',   notes: '' },
          { name: 'blood_group', type: 'VARCHAR(5)',  key: '',   notes: '' },
          { name: 'allergies',   type: 'TEXT',        key: '',   notes: '' },
          { name: 'emergency_contact', type: 'VARCHAR(15)', key: '', notes: '' },
        ],
      },
      {
        table: 'appointments',
        desc: 'Doctor-patient appointment records',
        columns: [
          { name: 'appt_id',     type: 'INT',      key: 'PK', notes: '' },
          { name: 'patient_id',  type: 'INT',      key: 'FK', notes: 'FK → patients.patient_id' },
          { name: 'doctor_id',   type: 'INT',      key: 'FK', notes: 'FK → users.user_id' },
          { name: 'scheduled_at',type: 'DATETIME', key: '',   notes: '' },
          { name: 'reason',      type: 'TEXT',     key: '',   notes: '' },
          { name: 'status',      type: "ENUM('booked','completed','cancelled')", key: '', notes: '' },
        ],
      },
      {
        table: 'prescriptions',
        desc: 'Medication prescriptions per visit',
        columns: [
          { name: 'rx_id',       type: 'INT',          key: 'PK', notes: '' },
          { name: 'appt_id',     type: 'INT',          key: 'FK', notes: 'FK → appointments.appt_id' },
          { name: 'medication',  type: 'VARCHAR(200)',  key: '',   notes: '' },
          { name: 'dosage',      type: 'VARCHAR(100)',  key: '',   notes: '' },
          { name: 'duration',    type: 'VARCHAR(50)',   key: '',   notes: '' },
          { name: 'prescribed_at', type: 'DATETIME',   key: '',   notes: '' },
        ],
      },
    ],
    Other: [
      {
        table: 'projects',
        desc: 'Top-level project or workspace entity',
        columns: [
          { name: 'project_id',  type: 'INT',          key: 'PK', notes: '' },
          { name: 'owner_id',    type: 'INT',          key: 'FK', notes: 'FK → users.user_id' },
          { name: 'name',        type: 'VARCHAR(150)',  key: '',   notes: '' },
          { name: 'description', type: 'TEXT',          key: '',   notes: '' },
          { name: 'status',      type: "ENUM('active','archived','completed')", key: '', notes: '' },
          { name: 'created_at',  type: 'DATETIME',      key: '',   notes: '' },
        ],
      },
      {
        table: 'tasks',
        desc: 'Task / issue tracking within projects',
        columns: [
          { name: 'task_id',     type: 'INT',         key: 'PK', notes: '' },
          { name: 'project_id',  type: 'INT',         key: 'FK', notes: 'FK → projects.project_id' },
          { name: 'assigned_to', type: 'INT',         key: 'FK', notes: 'FK → users.user_id' },
          { name: 'title',       type: 'VARCHAR(200)', key: '',  notes: '' },
          { name: 'priority',    type: "ENUM('low','medium','high','critical')", key: '', notes: '' },
          { name: 'status',      type: "ENUM('open','in_progress','review','closed')", key: '', notes: '' },
          { name: 'due_date',    type: 'DATE',        key: '',   notes: '' },
          { name: 'created_at',  type: 'DATETIME',    key: '',   notes: '' },
        ],
      },
    ],
  };

  schema.push(...(industryTables[industry] || industryTables.Other));

  /* Conditional tables from hints */
  if (hints.includes('Notifications & Alerts')) {
    schema.push({
      table: 'notifications',
      desc: 'System-generated notifications per user',
      columns: [
        { name: 'notif_id',   type: 'INT',          key: 'PK', notes: '' },
        { name: 'user_id',    type: 'INT',          key: 'FK', notes: 'FK → users.user_id' },
        { name: 'title',      type: 'VARCHAR(200)',  key: '',   notes: '' },
        { name: 'message',    type: 'TEXT',          key: '',   notes: '' },
        { name: 'is_read',    type: 'TINYINT(1)',    key: '',   notes: 'DEFAULT 0' },
        { name: 'created_at', type: 'DATETIME',      key: '',   notes: '' },
      ],
    });
  }

  if (hints.includes('File Upload & Management')) {
    schema.push({
      table: 'file_uploads',
      desc: 'Metadata for all uploaded files',
      columns: [
        { name: 'file_id',     type: 'INT',          key: 'PK', notes: '' },
        { name: 'uploader_id', type: 'INT',          key: 'FK', notes: 'FK → users.user_id' },
        { name: 'file_name',   type: 'VARCHAR(255)',  key: '',   notes: 'Original filename' },
        { name: 'file_path',   type: 'VARCHAR(500)',  key: '',   notes: 'Storage path / URL' },
        { name: 'file_size',   type: 'BIGINT',        key: '',   notes: 'Size in bytes' },
        { name: 'mime_type',   type: 'VARCHAR(100)',  key: '',   notes: 'e.g. image/jpeg' },
        { name: 'uploaded_at', type: 'DATETIME',      key: '',   notes: '' },
      ],
    });
  }

  if (hints.includes('Audit Logs')) {
    schema.push({
      table: 'audit_logs',
      desc: 'Immutable record of all system actions',
      columns: [
        { name: 'log_id',     type: 'INT',          key: 'PK', notes: '' },
        { name: 'user_id',    type: 'INT',          key: 'FK', notes: 'FK → users.user_id' },
        { name: 'action',     type: 'VARCHAR(100)',  key: '',   notes: 'e.g. UPDATE_USER, DELETE_RECORD' },
        { name: 'entity',     type: 'VARCHAR(80)',   key: '',   notes: 'Table / resource affected' },
        { name: 'entity_id',  type: 'INT',           key: '',   notes: 'ID of affected record' },
        { name: 'ip_address', type: 'VARCHAR(45)',   key: '',   notes: 'IPv4 or IPv6' },
        { name: 'created_at', type: 'DATETIME',      key: '',   notes: '' },
      ],
    });
  }

  if (hints.includes('Payment Integration')) {
    schema.push({
      table: 'payments',
      desc: 'Payment transaction records',
      columns: [
        { name: 'payment_id',  type: 'INT',           key: 'PK', notes: '' },
        { name: 'user_id',     type: 'INT',           key: 'FK', notes: 'FK → users.user_id' },
        { name: 'amount',      type: 'DECIMAL(10,2)', key: '',   notes: '' },
        { name: 'currency',    type: 'VARCHAR(5)',    key: '',   notes: 'ISO 4217, e.g. INR' },
        { name: 'gateway',     type: 'VARCHAR(50)',   key: '',   notes: 'e.g. Razorpay, Stripe' },
        { name: 'gateway_txn_id', type: 'VARCHAR(100)', key: 'UQ', notes: 'Gateway reference ID' },
        { name: 'status',      type: "ENUM('initiated','success','failed','refunded')", key: '', notes: '' },
        { name: 'paid_at',     type: 'DATETIME',      key: '',   notes: '' },
      ],
    });
  }

  return schema;
}

/* ══════════════════════════════════════════════════════════════
   BUILD & RENDER OUTPUT
   ══════════════════════════════════════════════════════════════ */
function buildOutput({ idea, type, industry, rawUsers, hints }) {
  const projectName = extractProjectName(idea);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const users   = buildUsers(idea, industry, rawUsers, hints);
  const modules = buildModules(idea, industry, type, hints);
  const features = buildFeatures(modules, hints, idea);
  const schema  = buildSchema(industry, users, hints, idea);

  /* ── Analyst intro ─────────────────────────── */
  document.getElementById('analystIntro').innerHTML = `
    <strong>Requirement Analysis Report</strong> — prepared for <strong>"${capitalise(projectName)}"</strong><br/>
    As a senior system analyst, I have reviewed your project brief and translated it into a structured software requirement document.
    This report covers the identified user roles (actors), core system modules, detailed feature specifications, and a
    recommended relational database schema. The proposed ${type.toLowerCase()} is targeted at the
    <strong>${industry}</strong> domain and is designed to be scalable, maintainable, and production-ready.
  `;

  /* ── Meta ──────────────────────────────────── */
  document.getElementById('outputMeta').textContent =
    `Generated ${dateStr} · ${type} · ${industry} · ${modules.length} modules · ${schema.length} tables`;

  /* ── Render Users ──────────────────────────── */
  const uc = document.getElementById('usersContent');
  uc.innerHTML = users.map(u => `
    <div class="user-row">
      <span class="user-badge ${badgeClass(u.type)}">${u.type}</span>
      <div>
        <div style="font-weight:600;color:var(--text-primary);font-size:.88rem">${u.role}</div>
        <div class="user-desc">${u.desc}</div>
      </div>
    </div>
  `).join('');

  /* ── Render Modules ────────────────────────── */
  const mc = document.getElementById('modulesContent');
  mc.innerHTML = modules.map((m, i) => `
    <div class="module-item">
      <span class="module-num">M${String(i+1).padStart(2,'0')}</span>
      <div>
        <div class="module-name">${m.name}</div>
        <div class="module-desc">${m.desc}</div>
      </div>
    </div>
  `).join('');

  /* ── Render Features ───────────────────────── */
  const fc = document.getElementById('featuresContent');
  fc.innerHTML = `<div class="features-grid">` +
    features.map(f => `
      <div class="feature-block">
        <div class="feature-module-label">${f.module}</div>
        <ul class="feature-list">
          ${f.features.map(feat => `<li>${feat}</li>`).join('')}
        </ul>
      </div>
    `).join('') +
  `</div>`;

  /* ── Render Schema ─────────────────────────── */
  const sc = document.getElementById('schemaContent');
  sc.innerHTML = `<div class="schema-tables">` +
    schema.map(t => `
      <div class="schema-table-block">
        <div class="schema-table-header">
          <i class="bi bi-table" style="color:var(--accent-3);font-size:.85rem"></i>
          <span class="schema-table-name">${t.table}</span>
          <span style="font-size:.7rem;color:var(--text-muted);margin-left:auto">${t.desc}</span>
        </div>
        <table class="schema-table-body">
          <thead>
            <tr>
              <th>Column</th><th>Type</th><th>Key</th><th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${t.columns.map(c => `
              <tr>
                <td class="col-name">${c.name}</td>
                <td class="col-type">${c.type}</td>
                <td class="col-key">${keyBadge(c.key)}</td>
                <td class="col-notes">${c.notes}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `).join('') +
  `</div>`;

  /* Show output section with scroll */
  const out = document.getElementById('outputSection');
  out.style.display = 'block';
  setTimeout(() => out.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);

  /* Store for export */
  window._reportData = { idea, type, industry, projectName, dateStr, users, modules, features, schema };
}

/* ── Helpers ─────────────────────────────────────────────── */
function badgeClass(type) {
  return { admin: 'badge-admin', user: 'badge-user', system: 'badge-system', external: 'badge-external' }[type] || 'badge-user';
}

function keyBadge(key) {
  if (key === 'PK') return '<span class="pk-badge">PK</span>';
  if (key === 'FK') return '<span class="fk-badge">FK</span>';
  if (key === 'UQ') return '<span class="pk-badge" style="background:rgba(52,211,153,.2);color:var(--users-color)">UQ</span>';
  return '';
}

function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ══════════════════════════════════════════════════════════════
   COPY SECTION
   ══════════════════════════════════════════════════════════════ */
function copySection(id, btn) {
  const el = document.getElementById(id);
  if (!el) return;
  const text = el.innerText || el.textContent || '';
  navigator.clipboard.writeText(text).then(() => {
    btn.innerHTML = '<i class="bi bi-check2"></i>';
    btn.classList.add('copied');
    showToast('Copied to clipboard!');
    setTimeout(() => {
      btn.innerHTML = '<i class="bi bi-clipboard"></i>';
      btn.classList.remove('copied');
    }, 2000);
  }).catch(() => showToast('Copy failed — try manually selecting the text.'));
}

/* ══════════════════════════════════════════════════════════════
   EXPORT .TXT
   ══════════════════════════════════════════════════════════════ */
function exportReport() {
  const d = window._reportData;
  if (!d) return;

  const divider = '═'.repeat(70);
  const line    = '─'.repeat(70);

  let txt = `
${divider}
  REQUIREMENT CLARIFIER AI — Software Requirement Document
${divider}
Project  : ${capitalise(d.projectName)}
Type     : ${d.type}
Industry : ${d.industry}
Date     : ${d.dateStr}
${divider}

ANALYST INTRODUCTION
${line}
As a senior system analyst, this document presents a structured requirement
analysis for "${capitalise(d.projectName)}", a ${d.type.toLowerCase()} in the ${d.industry} domain.

${divider}
1. SYSTEM USERS (ACTORS)
${divider}
${d.users.map(u => `▸ ${u.role} [${u.type.toUpperCase()}]\n  ${u.desc}`).join('\n\n')}

${divider}
2. SYSTEM MODULES
${divider}
${d.modules.map((m, i) => `M${String(i+1).padStart(2,'0')} ${m.name}\n    ${m.desc}`).join('\n\n')}

${divider}
3. FEATURE SPECIFICATIONS
${divider}
${d.features.map(f =>
  `[ ${f.module} ]\n` + f.features.map(feat => `  • ${feat}`).join('\n')
).join('\n\n')}

${divider}
4. DATABASE SCHEMA
${divider}
${d.schema.map(t =>
  `TABLE: ${t.table}\n${t.desc}\n` +
  `${'Column'.padEnd(22)} ${'Type'.padEnd(28)} ${'Key'.padEnd(6)} Notes\n` +
  `${'-'.repeat(80)}\n` +
  t.columns.map(c =>
    `${c.name.padEnd(22)} ${c.type.padEnd(28)} ${c.key.padEnd(6)} ${c.notes}`
  ).join('\n')
).join('\n\n')}

${divider}
Generated by Requirement Clarifier AI
${divider}
`.trim();

  const blob = new Blob([txt], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `requirements_${d.projectName.replace(/\s+/g,'_').toLowerCase()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Report exported successfully!');
}

/* ══════════════════════════════════════════════════════════════
   RESET FORM
   ══════════════════════════════════════════════════════════════ */
function resetForm() {
  textarea.value = '';
  charCount.textContent = '0 / 800';
  document.getElementById('projectType').value   = '';
  document.getElementById('industry').value      = '';
  document.getElementById('expectedUsers').value = '';
  document.querySelectorAll('#featureHints input').forEach(cb => cb.checked = false);
  document.getElementById('outputSection').style.display = 'none';
  document.getElementById('validationMsg').style.display = 'none';
  window._reportData = null;
  localStorage.removeItem(LS_KEY);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast('Form cleared.');
}

/* ══════════════════════════════════════════════════════════════
   TOAST
   ══════════════════════════════════════════════════════════════ */
let _toastTimer;
function showToast(msg) {
  const t = document.getElementById('toastMsg');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}
