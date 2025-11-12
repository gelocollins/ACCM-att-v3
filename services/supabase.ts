
import { createClient } from '@supabase/supabase-js';
import { Branch, Employee, AttendanceRecord } from '../types';

const supabaseUrl = 'https://yjytufyujhlydjxbccry.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqeXR1Znl1amhseWRqeGJjY3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NDMxODMsImV4cCI6MjA3ODUxOTE4M30.5VQIXROWtO4TMSjZfnePbTMRN4oRvGAh13jE9Xuq3t8';
export const supabase = createClient(supabaseUrl, supabaseKey);

// Hardcoded branches for simplicity
const branches: Branch[] = [
    { id: '1d6f4c58-4b71-44b8-80e5-2b0717b07e54', name: 'Headquarters 🏢' },
    { id: '8a9c441a-1d13-4687-9b2e-9d22b2f69e71', name: 'Downtown Branch 🏙️' },
    { id: 'f5c4a5c6-7a7d-4b8c-8c8e-6e2c2f2a2e2d', name: 'Westside Outlet 🏪' },
];

export const getBranches = async (): Promise<Branch[]> => {
    // In a real app, you would fetch from the 'branches' table.
    // For this example, we return the hardcoded list.
    return Promise.resolve(branches);
};

export const addEmployee = async (name: string, photoDataUrl: string, branchId: string): Promise<void> => {
    const { error } = await supabase
        .from('employees')
        .insert({ 
            name, 
            branch_id: branchId, 
            registration_photo: photoDataUrl 
        });
    
    if (error) throw error;
};

export const getEmployeesByBranch = async (branchId: string): Promise<Employee[]> => {
    const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('branch_id', branchId)
        .order('name');
        
    if (error) throw error;
    return data;
};

export const getOpenAttendance = async (employeeId: string): Promise<{ id: string } | null> => {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
        .from('attendance')
        .select('id')
        .eq('employee_id', employeeId)
        .eq('date', today)
        .is('time_out', null)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
        throw error;
    }
    return data;
};

export const addTimeIn = async (employeeId: string, branchId: string, photoDataUrl: string): Promise<void> => {
    const { error } = await supabase.from('attendance').insert({
        employee_id: employeeId,
        branch_id: branchId,
        time_in_photo: photoDataUrl,
    });

    if (error) throw error;
};

export const addTimeOut = async (attendanceId: string, employeeId: string, photoDataUrl: string): Promise<void> => {
    const { error } = await supabase
        .from('attendance')
        .update({
            time_out: new Date().toISOString(),
            time_out_photo: photoDataUrl,
        })
        .eq('id', attendanceId);

    if (error) throw error;
};


export const getAttendanceRecords = async (branchId: string, date: string): Promise<AttendanceRecord[]> => {
    const { data, error } = await supabase
        .from('attendance')
        .select(`
            id,
            time_in,
            time_in_photo,
            time_out,
            time_out_photo,
            employee_id,
            employee:employees (
                name,
                registration_photo
            )
        `)
        .eq('branch_id', branchId)
        .eq('date', date)
        .order('time_in', { ascending: false });

    if (error) throw error;
    return data as unknown as AttendanceRecord[];
};