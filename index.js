const express = require('express');
const bodyParser = require('body-parser');
const csv = require('csv-parser');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(bodyParser.json());

// Read the CSV file
const csvData = [];
const csvFilePath = 'your-data.csv';

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    csvData.push(row);
  });

// Create a new entry
app.post('/api/data', (req, res) => {
  const newData = req.body;
  csvData.push(newData);
  fs.appendFile(csvFilePath, `\n${Object.values(newData).join(',')}`, (err) => {
    if (err) {
      res.status(500).send('Error creating entry in CSV file.');
    } else {
      res.status(201).json(newData);
    }
  });
});

// Read a specific entry by ID
app.get('/api/data/:id', (req, res) => {
  const id = req.params.id;
  const entry = csvData[id];
  if (entry) {
    res.json(entry);
  } else {
    res.status(404).send('Entry not found.');
  }
});

// Update a specific entry by ID
app.put('/api/data/:id', (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;
  if (csvData[id]) {
    csvData[id] = updatedData;
    fs.writeFileSync(csvFilePath, ''); // Clear the CSV file
    csvData.forEach((row) => {
      fs.appendFile(csvFilePath, Object.values(row).join(',') + '\n', (err) => {
        if (err) {
          res.status(500).send('Error updating CSV file.');
        }
      });
    });
    res.json(updatedData);
  } else {
    res.status(404).send('Entry not found.');
  }
});

// Delete a specific entry by ID
app.delete('/api/data/:id', (req, res) => {
  const id = req.params.id;
  if (csvData[id]) {
    csvData.splice(id, 1);
    fs.writeFileSync(csvFilePath, ''); // Clear the CSV file
    csvData.forEach((row) => {
      fs.appendFile(csvFilePath, Object.values(row).join(',') + '\n', (err) => {
        if (err) {
          res.status(500).send('Error updating CSV file.');
        }
      });
    });
    res.status(204).send();
  } else {
    res.status(404).send('Entry not found.');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

