const mysql = require('mysql2'); // To interact with a MySQL database

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'mydatabase'
}).promise(); // Enables async/await support

module.exports = pool;

const express = require('express');
//const pool = require('./dbConfig');  // added for DB intigrtion
const app = express();
const port = 3000;
app.listen(port, (er) => console.log('server started'))
app.use(express.json());

let students = [
    { id: 101, name: 'Hello', mail: 'mail.com'},
    { id: 201, name: 'manik', mail: 'manik.com'},
    { id: 3, name: 'nene', mail: 'nadhe.com'},
    { id: 4, name: 'nuvve', mail: 'neede.com'}
]

// Get students from DB
app.get('/studentsfromdb', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM students'
  );
        res.json(rows);
});

// Get students for above array
app.get('/students', (req, res) => {
    res.send(students);
  });

  app.get('/students/:id', (req, res) => {
    const studentId = parseInt(req.params.id); 
    const student = students.find(s => s.id === studentId); // Find the student with the matching ID
    
    if (student) {
      res.json(student); 
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  });


// POST API to Add a New Student in DB
app.post('/addstudent', async (req, res) => {
  const { FirstName, LastName, Mail } = req.body;

  if (!FirstName || !Mail || !LastName ) {
      return res.status(400).json({ message: 'First name and email and LastName are required' });
  }

  try {
      const [result] = await pool.query(
          'INSERT INTO students (FirstName, LastName, Mail) VALUES (?, ?, ?)',
          [FirstName, LastName, Mail]
      );
      const [rows] = await pool.query(
        'SELECT * FROM students'
      );
      res.status(201).json({ message: 'Student added successfully', studentId: rows });

  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});



  // POST route to add a new student
app.post('/studentsin', (req, res) => {
    // Get the data sent in the body of the request
    const { name, mail } = req.body;
  
    // Validate that both name and age are provided
    if (!name || !mail) {
      return res.status(400).json({ message: 'Name and mail are required' });
    }
  
    // Create a new student object
    const newStudent = {
      id: students.length + 1, // Automatically generate a new ID
      name,
      mail
    };
  
    // Add the new student to the list
    students.push(newStudent);
  
    // Return the new student with a 201 status code (Created)
    res.status(201).json(newStudent);
  });



  // PATCH API to Update Student by ID in DB
app.patch('/students/:id', async (req, res) => {
  const studentId = parseInt(req.params.id);
  const { FirstName, LastName, Mail, City } = req.body;

  // checking weather the give id is valid or not...
  if (isNaN(studentId) || studentId <= 0) {
    return res.status(400).json({ message: 'Invalid student ID' });
  }

  // Check if at least one field is provided for update
  if (!FirstName && !LastName && !Mail && !City) {
      return res.status(400).json({ message: 'Provide at least one field to update' });
  }

  try {
      // Prepare dynamic SET clause
      let query = 'UPDATE students SET ';
      let fields = [];
      let values = [];

      if (FirstName) {
          fields.push('FirstName = ?');
          values.push(FirstName);
      }
      if (LastName) {
          fields.push('LastName = ?');
          values.push(LastName);
      }
      if (Mail) {
          fields.push('Mail = ?');
          values.push(Mail);
      }
      if (City) {
        fields.push('City = ?');
        values.push(City);
    }

      // Combine query and add WHERE condition
      query += fields.join(', ') + ' WHERE id = ?';
      values.push(studentId);

      // Execute update query
      const [result] = await pool.query(query, values);

      
      if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Student not found' });
      }

      res.json({ message: 'Student updated successfully' });

  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});


  // PATCH route to update student details by ID
app.patch('/studentsupdate/:id', (req, res) => {
    const studentId = parseInt(req.params.id);  // Get the student ID from URL params
    const { name, mail } = req.body;  // Get the updated data from the request body
  
    // Find the student by ID
    const student = students.find(s => s.id === studentId);
  
    // If student doesn't exist, return a 404 error
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
  
    // Update the student's fields if provided
    if (name) {
      student.name = name;
    }
    if (mail) {
      student.mail = mail;
    }
  
    // Return the updated student details
    res.json(student);
  });


  app.delete('/studentsdelete/:id', (req, res) => {
    console.log(students);
    const studentId = parseInt(req.params.id); 
    const student = students.find(s => s.id === studentId);
    const Index = students.findIndex(s => s.id === studentId);

    if (student) {
        students.splice( Index,1);
        res.json(students);
      } else {
        res.status(404).json({ message: 'Student data not found' });
      }
  });

  app.delete('/studentsdeleteinDB/:id', async (req, res) => {
    const studentId = parseInt(req.params.id);

    // Validate student ID
    if (isNaN(studentId) || studentId <= 0) {
        return res.status(400).json({ message: 'Invalid student ID' });
    }

    try {
        // Execute DELETE query
        const [result] = await pool.query('DELETE FROM students WHERE id = ?', [studentId]);

        // Check if the student exists
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json({ message: 'Student deleted successfully' });

    } catch (error) {
        //console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});








app.delete('/studentsdel/:id', async (req, res) => {
  const studentId = parseInt(req.params.id);

  // Validate student ID
  if (isNaN(studentId) || studentId <= 0) {
      return res.status(400).json({ message: 'Invalid student ID' });
  }

  try {
      // Log before deletion
      //console.log('Attempting to DELETE student ID:', studentId);

      // Execute DELETE query (permanently removes row)
      const [result] = await pool.query('DELETE FROM students WHERE id = ?', [studentId]);

      //console.log('Executed DELETE:', result); // Log output

      // Check if the student exists
      if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Student not found' });
      }

      res.status(200).json({ message: 'Student deleted successfully' });

  } catch (error) {
      console.error('Error deleting student:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});
