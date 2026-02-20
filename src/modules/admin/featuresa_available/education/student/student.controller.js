import prisma from "../../../../../core/config/db.js";
import bcrypt from "bcryptjs";
import { uploadImage } from "../../../branding/upload.service.js";

/**
 * 👑 Create Student
 */
export const createStudent = async (req, res) => {
    try {
        const { studentId, firstName, lastName, email, phone, gender, dateOfBirth, address, parentName, parentPhone, classId, password } = req.body;
        const { tenantId } = req.user;

        if (!firstName || !lastName) {
            return res.status(400).json({ success: false, message: "First name and Last name are required" });
        }

        if (classId) {
            const cls = await prisma.class.findFirst({
                where: { id: classId, tenantId }
            });
            if (!cls) {
                return res.status(404).json({ success: false, message: "Selected class not found" });
            }
        }

        // 🖼️ Upload Profile Picture if provided
        let profilePictureUrl = null;
        if (req.file) {
            profilePictureUrl = await uploadImage(req.file, `tenants/${tenantId}/students`);
        }

        // 🔐 Hash Password if provided
        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const student = await prisma.student.create({
            data: {
                studentId,
                firstName,
                lastName,
                email,
                classId,
                phone,
                gender,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                address,
                parentName,
                parentPhone,
                password: hashedPassword,
                profilePictureUrl,
                tenantId
            },
            include: {
                class: true
            }
        });

        res.status(201).json({ success: true, message: "Student created successfully", student });
    } catch (error) {
        console.error("CREATE STUDENT ERROR:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to create student" });
    }
};

/**
 * 👑 List All Students
 */
export const listStudents = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const students = await prisma.student.findMany({
            where: { tenantId },
            include: {
                class: true
            },
            orderBy: { createdAt: "desc" }
        });

        res.json({ success: true, count: students.length, students });
    } catch (error) {
        console.error("LIST STUDENTS ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to fetch students" });
    }
};

/**
 * 👑 Get Student Details
 */
export const getStudentDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { tenantId } = req.user;

        const student = await prisma.student.findFirst({
            where: { id, tenantId },
            include: {
                class: true
            }
        });

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        res.json({ success: true, student });
    } catch (error) {
        console.error("GET STUDENT DETAILS ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to fetch student details" });
    }
};

/**
 * 👑 Update Student
 */
export const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { tenantId } = req.user;
        const data = req.body;

        // Security: Ensure student belongs to tenant
        const existingStudent = await prisma.student.findFirst({
            where: { id, tenantId }
        });

        if (!existingStudent) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        // Prevent modification of sensitive fields
        delete data.id;
        delete data.tenantId;

        if (data.dateOfBirth) {
            data.dateOfBirth = new Date(data.dateOfBirth);
        }

        if (data.classId) {
            const cls = await prisma.class.findFirst({
                where: { id: data.classId, tenantId }
            });
            if (!cls) {
                return res.status(404).json({ success: false, message: "Selected class not found" });
            }
        }

        // 🖼️ Upload New Profile Picture if provided
        if (req.file) {
            data.profilePictureUrl = await uploadImage(req.file, `tenants/${tenantId}/students`);
        }

        // 🔐 Hash New Password if provided
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        const student = await prisma.student.update({
            where: { id },
            data,
            include: {
                class: true
            }
        });

        res.json({ success: true, message: "Student updated successfully", student });
    } catch (error) {
        console.error("UPDATE STUDENT ERROR:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to update student" });
    }
};

/**
 * 👑 Delete Student
 */
export const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { tenantId } = req.user;

        // deleteMany allows using non-unique fields in where
        const result = await prisma.student.deleteMany({
            where: { id, tenantId }
        });

        if (result.count === 0) {
            return res.status(404).json({ success: false, message: "Student not found or already deleted" });
        }

        res.json({ success: true, message: "Student deleted successfully" });
    } catch (error) {
        console.error("DELETE STUDENT ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to delete student" });
    }
};
