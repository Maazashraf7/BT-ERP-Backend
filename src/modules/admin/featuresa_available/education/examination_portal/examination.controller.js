import prisma from "../../../../../core/config/db.js";

/**
 * 📝 Create Examination (now linked to a Class)
 */
export const createExamination = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { name, examType, academicYear, term, startDate, endDate, description, classId } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Examination name is required" });
        }

        // If classId provided, verify it belongs to this tenant
        if (classId) {
            const cls = await prisma.class.findFirst({ where: { id: classId, tenantId } });
            if (!cls) {
                return res.status(404).json({ success: false, message: "Class not found" });
            }
        }

        const examination = await prisma.examination.create({
            data: {
                tenantId,
                name,
                examType,
                academicYear,
                term,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                description,
                classId: classId || null,
            },
            include: {
                class: true,
            }
        });

        res.status(201).json({
            success: true,
            message: "Examination created successfully",
            examination,
        });
    } catch (error) {
        console.error("CREATE EXAMINATION ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 📝 List All Examinations by Class ID (classId required in params)
 */
export const listExaminations = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { classId } = req.params;

        if (!classId) {
            return res.status(400).json({ success: false, message: "Class ID is required" });
        }

        // Verify class belongs to this tenant
        const cls = await prisma.class.findFirst({ where: { id: classId, tenantId } });
        if (!cls) {
            return res.status(404).json({ success: false, message: "Class not found" });
        }

        const examinations = await prisma.examination.findMany({
            where: { tenantId, classId },
            include: {
                schedules: {
                    orderBy: { examDate: "asc" },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Remove redundant classId field from each exam and nest properly
        const formattedExams = examinations.map(({ classId: _cid, ...exam }) => exam);

        res.json({
            success: true,
            class: {
                ...cls,
                examinations: formattedExams.map(exam => ({
                    ...exam,
                    schedules: exam.schedules,
                })),
            },
        });
    } catch (error) {
        console.error("LIST EXAMINATIONS ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to fetch examinations" });
    }
};

/**
 * 📝 Create Exam Schedule (examinationId from URL params)
 */
export const createExamSchedule = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { examId } = req.params;  // ← from URL
        const { classId, subject, examDate, startTime, endTime, roomNumber } = req.body;

        if (!subject || !examDate) {
            return res.status(400).json({
                success: false,
                message: "Subject and Exam Date are required",
            });
        }

        // Verify examination belongs to this tenant
        const exam = await prisma.examination.findFirst({ where: { id: examId, tenantId } });
        if (!exam) {
            return res.status(404).json({ success: false, message: "Examination not found" });
        }

        // If classId provided, verify it belongs to this tenant
        if (classId) {
            const cls = await prisma.class.findFirst({ where: { id: classId, tenantId } });
            if (!cls) {
                return res.status(404).json({ success: false, message: "Class not found" });
            }
        }

        const schedule = await prisma.examSchedule.create({
            data: {
                tenantId,
                examinationId: examId,
                classId: classId || exam.classId || null,
                subject,
                examDate: new Date(examDate),
                startTime,
                endTime,
                roomNumber,
            },
        });

        res.status(201).json({
            success: true,
            message: "Exam schedule added successfully",
            schedule,
        });
    } catch (error) {
        console.error("CREATE EXAM SCHEDULE ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 📝 Delete Exam Schedule by ID
 */
export const deleteExamSchedule = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;

        const result = await prisma.examSchedule.deleteMany({
            where: { id, tenantId },
        });

        if (result.count === 0) {
            return res.status(404).json({ success: false, message: "Exam schedule not found" });
        }

        res.json({
            success: true,
            message: "Exam schedule deleted successfully",
        });
    } catch (error) {
        console.error("DELETE EXAM SCHEDULE ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 📝 Get Exam Schedules by Exam ID (from URL params)
 */
export const getDatesheet = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { examId } = req.params;

        const schedules = await prisma.examSchedule.findMany({
            where: { examinationId: examId, tenantId },
            orderBy: { examDate: "asc" },
        });

        res.json({
            success: true,
            schedules,
        });
    } catch (error) {
        console.error("GET DATESHEET ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to fetch schedules" });
    }
};

/**
 * 📝 Update Examination
 */
export const updateExamination = async (req, res) => {
    try {
        const { id } = req.params;
        const { tenantId } = req.user;
        const data = req.body;

        const existing = await prisma.examination.findFirst({
            where: { id, tenantId }
        });

        if (!existing) {
            return res.status(404).json({ success: false, message: "Examination not found" });
        }

        delete data.tenantId;
        delete data.id;

        if (data.startDate) data.startDate = new Date(data.startDate);
        if (data.endDate) data.endDate = new Date(data.endDate);

        const examination = await prisma.examination.update({
            where: { id },
            data,
            include: { class: true },
        });

        res.json({
            success: true,
            message: "Examination updated successfully",
            examination,
        });
    } catch (error) {
        console.error("UPDATE EXAMINATION ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to update examination" });
    }
};

/**
 * 📝 Delete Examination
 */
export const deleteExamination = async (req, res) => {
    try {
        const { id } = req.params;
        const { tenantId } = req.user;

        const result = await prisma.examination.deleteMany({
            where: { id, tenantId }
        });

        if (result.count === 0) {
            return res.status(404).json({ success: false, message: "Examination not found or already deleted" });
        }

        res.json({ success: true, message: "Examination deleted successfully" });
    } catch (error) {
        console.error("DELETE EXAMINATION ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to delete examination" });
    }
};

/**
 * 📝 Update Exam Schedule
 */
export const updateExamSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { tenantId } = req.user;
        const data = req.body;

        const existing = await prisma.examSchedule.findFirst({
            where: { id, tenantId }
        });

        if (!existing) {
            return res.status(404).json({ success: false, message: "Exam schedule not found" });
        }

        delete data.tenantId;
        delete data.id;

        if (data.examDate) data.examDate = new Date(data.examDate);

        const schedule = await prisma.examSchedule.update({
            where: { id },
            data,
            include: { class: true },
        });

        res.json({
            success: true,
            message: "Exam schedule updated successfully",
            schedule,
        });
    } catch (error) {
        console.error("UPDATE EXAM SCHEDULE ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to update exam schedule" });
    }
};
