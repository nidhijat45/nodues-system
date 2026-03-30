CREATE DATABASE IF NOT EXISTS nodues_db;
USE nodues_db;
-- Departments
CREATE TABLE departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE
);

INSERT INTO departments (name, code) VALUES
('Computer Science', 'CS'),
('Information Technology', 'IT'),
('CS & IT', 'CSIT'),
('Cyber Security', 'CY'),
('AI & Data Science', 'AIDS'),
('Electronics & Communication', 'ECE');

-- Users (all roles in one table)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  mobile VARCHAR(15),
  role ENUM('admin','teacher','student','account','exam') NOT NULL,
  department_id INT,
  enrollment_no VARCHAR(20),        -- students only
  semester TINYINT,                 -- students only (1-8)
  section VARCHAR(5),               -- students only (A/B/C)
  year Tinyint,                        -- students only
  designation VARCHAR(50),          -- teachers only (assistant/associate/doctorate)
  is_hod BOOLEAN DEFAULT FALSE,     -- teachers only
  total_fees INT DEFAULT 50000,     -- fee details
  paid_fees INT DEFAULT 0,          -- fee details
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Default admin
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@college.com', '$2b$10$placeholder', 'admin');

-- Assignments
CREATE TABLE assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  department_id INT NOT NULL,
  semester TINYINT NOT NULL,
  section VARCHAR(5) NOT NULL,
  subject_name VARCHAR(100) NOT NULL,
  assignment_name VARCHAR(150) NOT NULL,
  given_date DATE NOT NULL,
  due_date DATE NOT NULL,
  file_path VARCHAR(255),           -- optional file
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id),
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Assignment submissions (per student)
CREATE TABLE assignment_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  student_id INT NOT NULL,
  is_submitted BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP,
  UNIQUE KEY unique_submission (assignment_id, student_id),
  FOREIGN KEY (assignment_id) REFERENCES assignments(id),
  FOREIGN KEY (student_id) REFERENCES users(id)
);

-- Lab Manuals
CREATE TABLE lab_manuals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  department_id INT NOT NULL,
  semester TINYINT NOT NULL,
  subject_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id),
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Lab Manual submissions (per student)
CREATE TABLE lab_manual_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lab_manual_id INT NOT NULL,
  student_id INT NOT NULL,
  is_submitted BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP,
  UNIQUE KEY unique_lab_submission (lab_manual_id, student_id),
  FOREIGN KEY (lab_manual_id) REFERENCES lab_manuals(id),
  FOREIGN KEY (student_id) REFERENCES users(id)
);

-- No Dues Requests (one per student, tracks overall status)
CREATE TABLE nodues_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL UNIQUE,
  status ENUM('draft','pending_teachers','pending_account','pending_hod','pending_exam','approved','rejected') DEFAULT 'draft',
  initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id)
);

-- Teacher-level approvals (one row per teacher per student request)
CREATE TABLE teacher_approvals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nodues_request_id INT NOT NULL,
  teacher_id INT NOT NULL,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  comment TEXT,
  reviewed_at TIMESTAMP,
  FOREIGN KEY (nodues_request_id) REFERENCES nodues_requests(id),
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- Account Department approval
CREATE TABLE account_approvals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nodues_request_id INT NOT NULL UNIQUE,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  reviewed_by INT,
  reviewed_at TIMESTAMP,
  FOREIGN KEY (nodues_request_id) REFERENCES nodues_requests(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- HOD approval
CREATE TABLE hod_approvals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nodues_request_id INT NOT NULL UNIQUE,
  hod_id INT NOT NULL,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  comment TEXT,
  reviewed_at TIMESTAMP,
  FOREIGN KEY (nodues_request_id) REFERENCES nodues_requests(id),
  FOREIGN KEY (hod_id) REFERENCES users(id)
);

-- Exam Department approval (final)
CREATE TABLE exam_approvals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nodues_request_id INT NOT NULL UNIQUE,
  status ENUM('pending','approved') DEFAULT 'pending',
  reviewed_by INT,
  reviewed_at TIMESTAMP,
  certificate_generated BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (nodues_request_id) REFERENCES nodues_requests(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);
select * from departments;
USE nodues_db;
INSERT INTO users (name, email, password, role)
VALUES ('Admin', 'admin@college.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
 USE nodues_db;
UPDATE users 
SET password = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE email = 'admin@college.com';
INSERT INTO users (name, email, password, role)
VALUES ('Account Staff', 'account@college.com',
'$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'account');
INSERT INTO users (name, email, password, role)
VALUES ('Exam Staff', 'exam@college.com',
'$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'exam');
UPDATE users SET is_hod = true WHERE email = 'paras@college.com';