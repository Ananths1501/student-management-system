-- Create the database
CREATE DATABASE IF NOT EXISTS student_management;

-- Use the database
USE student_management;

-- Create the students table
CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(255) NOT NULL,
  lastName VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(255) NOT NULL,
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  dateOfBirth DATE NOT NULL,
  course VARCHAR(255) NOT NULL,
  enrollmentDate DATE NOT NULL,
  address TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample data
INSERT INTO students (firstName, lastName, email, phone, gender, dateOfBirth, course, enrollmentDate, address)
VALUES 
('John', 'Doe', 'john.doe@example.com', '123-456-7890', 'Male', '2000-01-15', 'Computer Science', '2022-09-01', '123 Main St, Anytown'),
('Jane', 'Smith', 'jane.smith@example.com', '987-654-3210', 'Female', '2001-05-20', 'Engineering', '2022-09-01', '456 Oak Ave, Somewhere'),
('Michael', 'Johnson', 'michael.j@example.com', '555-123-4567', 'Male', '1999-11-10', 'Business', '2021-09-01', '789 Pine Rd, Nowhere'),
('Emily', 'Williams', 'emily.w@example.com', '555-987-6543', 'Female', '2002-03-25', 'Arts', '2023-01-15', '321 Elm St, Anywhere'),
('David', 'Brown', 'david.b@example.com', '555-555-5555', 'Male', '2000-07-30', 'Medicine', '2022-01-15', '654 Maple Dr, Someplace');
