const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://lqpzdqxzaysslbadnooi.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxcHpkcXh6YXlzc2xiYWRub29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDExNDUsImV4cCI6MjA4ODQ3NzE0NX0.mQZ4lD4ss5ANSmErSkdfMyYsBM1otZx5Wj2NVbE-nA8');

async function testInsert() {
    console.log("Testing insert into course_sessions...");
    // Get an existing class
    const { data: firstClass } = await supabase.from('classes').select('id, teacher_id').limit(1).single();
    if (!firstClass) {
        console.log("No classes found");
        return;
    }

    const { data, error } = await supabase.from('course_sessions').insert({
        class_id: firstClass.id,
        scheduled_time: '2026-03-22T08:00:00',
        status: 'planned'
    }).select();

    console.log("Result:", data);
    console.log("Error:", error);
}

testInsert();
