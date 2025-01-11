import { Tool } from 'langchain/tools';
import { createClient } from '@supabase/supabase-js';
import dotenv from "dotenv";

dotenv.config();
// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Define the schedule_appointment tool
class ScheduleAppointmentTool extends Tool {
  constructor() {
    super();
    this.name = 'schedule_appointment';
    this.description =
      'Schedules an appointment for a patient with a doctor. Takes patient_name, doctor_name, appointment_date, appointment_time, and reason.';
  }

  async _call(input) {
    // Parse the input (should be a JSON string)
    const {
      patient_name,
      doctor_name,
      appointment_date,
      appointment_time,
      reason,
    } = JSON.parse(input);

    // Call the Supabase RPC function
    const { data, error } = await supabase.rpc('schedule_appointment', {
      patient_name,
      doctor_name,
      appointment_date,
      appointment_time,
      reason,
    });

    if (error) {
      return `Error scheduling appointment: ${error.message}`;
    }

    return data || 'Appointment scheduled successfully';
  }
}
