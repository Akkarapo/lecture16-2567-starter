import { NextRequest, NextResponse } from "next/server"
import { DB } from "@lib/DB";
import { zStudentPostBody } from "@lib/schema";
import { zStudentPutBody } from "@lib/schema";
import { request } from "http";

// GET http://localhost:3000/api/students
// GET http://localhost:3000/api/students?program=CPE
export const GET = async (request:NextRequest) => {

    const program_name = request.nextUrl.searchParams.get('program');

    let filtered = DB.students
    if (program_name !== null){
        filtered = filtered.filter( (student) => student.program === program_name)
    }

    return NextResponse.json({
        ok: "true",
        students: filtered
    })
}

// POST http://localhost:3000/api/students
export const POST = async (request:NextRequest) => {
    const body =await request.json();
    // validate student data
    const parseResult = zStudentPostBody.safeParse(body);
    if (parseResult.success === false) {
        return NextResponse.json({
            ok: false,
            message: parseResult.error.issues[0].message,
            },{
                status: 400,
            });
    }

    // check studentID duplication
    // foundID = -1 (not found)
    // foundID>= 0 (found)
    const foundID = DB.students.findIndex( student => student.studentId === body.studentID);
    if (foundID >= 0) {
        return NextResponse.json({
            ok: false,
            message: `Student ID ${body.studentID} already exists`
        },{
            status: 409,
        });
    }

    // add new student to database
    DB.students.push(body);
    // send ok response to client 
    return NextResponse.json({
        ok: true,
        message: `Student ID ${body.studentID} has been added`
    });
}

// PUT http://localhost:3000/api/students
export const PUT = async (request:NextRequest) => {
    const body = await request.json();

    // validate student data
    const parseResult = zStudentPutBody.safeParse(body);
    if (parseResult.success === false) {
        return NextResponse.json({
            ok: false,
            message: parseResult.error.issues[0].message,
            },{
                status: 400,
            });
    }

    // check studentID duplication
    // foundID = -1 (not found)
    // foundID>= 0 (found)
    const foundID = DB.students.findIndex( student => student.studentId === body.studentID);
    if (foundID === -1) {
        return NextResponse.json({
            ok: false,
            message: `Student ID ${body.studentID} not exists`
        },{
            status: 404,
        });
    }

    // update student data
    DB.students[foundID] = { ...DB.students[foundID], ...body};
    return NextResponse.json({
        ok: true,
        message: DB.students[foundID]
    });
}

export const DELETE = async(request:NextRequest)