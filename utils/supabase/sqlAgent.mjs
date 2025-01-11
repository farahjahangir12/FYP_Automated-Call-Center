import { createClient } from '@supabase/supabase-js';
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Create readline interface for user interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to ask a question
function askQuestion(question) {
  return new Promise((resolve) => rl.question(question, (answer) => resolve(answer.trim())));
}

// Validate patient name against the database
async function validatePatientName(patientName) {
  const { data, error } = await supabase.from('patients').select('*').eq('name', patientName);
  if (error) throw new Error('Database error while validating patient name.');
  return data.length > 0;
}

// Validate doctor name against the database
async function validateDoctorName(doctorName) {
  const { data, error } = await supabase.from('doctors').select('*').eq('name', doctorName);
  if (error) throw new Error('Database error while validating doctor name.');
  return data.length > 0;
}

// Validate and format date
function validateAndFormatDate(dateInput) {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) throw new Error('Invalid date format. Please provide a valid date (e.g., YYYY-MM-DD).');
  return date.toISOString().split('T')[0];
}

// Validate and format time
function validateAndFormatTime(timeInput) {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/; // HH:mm format
  if (!timeRegex.test(timeInput)) throw new Error('Invalid time format. Please provide a valid time (e.g., HH:mm).');
  return timeInput;
}

// Main function to gather and validate inputs
async function gatherAppointmentDetails() {
  let patientName, doctorName, appointmentDate, appointmentTime, reason;

  while (!patientName) {
    const input = await askQuestion("What is the patient's name? ");
    if (await validatePatientName(input)) {
      patientName = input;
    } else {
      console.log(`Sorry, we couldn't find a patient named "${input}". Please double-check or register the patient first.`);
    }
  }

  while (!doctorName) {
    const input = await askQuestion("What is the doctor's name? ");
    if (await validateDoctorName(input)) {
      doctorName = input;
    } else {
      console.log(`Sorry, we couldn't find a doctor named "${input}". Please try again.`);
    }
  }

  while (!appointmentDate) {
    const input = await askQuestion("What is the appointment date (e.g., YYYY-MM-DD)? ");
    try {
      appointmentDate = validateAndFormatDate(input);
    } catch (err) {
      console.log(err.message);
    }
  }

  while (!appointmentTime) {
    const input = await askQuestion("What is the appointment time (e.g., HH:mm)? ");
    try {
      appointmentTime = validateAndFormatTime(input);
    } catch (err) {
      console.log(err.message);
    }
  }

  while (!reason) {
    reason = await askQuestion("What is the reason for the appointment? ");
    if (!reason) console.log("Reason cannot be empty. Please provide a valid reason.");
  }

  return { patient_name: patientName, doctor_name: doctorName, appointment_date: appointmentDate, appointment_time: appointmentTime, reason };
}

// Function to schedule the appointment
async function scheduleAppointment(input) {
  try {
    const { patient_name, doctor_name, appointment_date, appointment_time, reason } = input;

    // Call the Supabase RPC function
    const { data, error } = await supabase.rpc('schedule_appointment', {
      patient_name,
      doctor_name,
      appointment_date,
      appointment_time,
      reason,
    });

    if (error) {
      throw new Error(`Error scheduling appointment: ${error.message}`);
    }

    console.log("Appointment scheduled successfully!");
    console.log(data || "Your appointment details have been saved.");
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

// Main function to drive the process
async function main() {
  console.log("Welcome to the Hospital A.B.C. How May I help you?");
  const appointmentDetails = await gatherAppointmentDetails();
  await scheduleAppointment(appointmentDetails);
  rl.close();
}

// Start the script
main();
