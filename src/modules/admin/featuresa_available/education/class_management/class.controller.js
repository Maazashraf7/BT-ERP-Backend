import prisma from "../../../../../core/config/db.js";

/**
 * 🏫 Create Class
 */
export const createClass = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { name, section, academicYear, description } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Class name is required",
            });
        }

        const newClass = await prisma.class.create({
            data: {
                tenantId,
                name,
                section,
                academicYear,
                description,
            },
        });

        res.status(201).json({
            success: true,
            message: "Class created successfully",
            class: newClass,
        });
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "A class with this name, section, and academic year already exists",
            });
        }
        console.error("CREATE CLASS ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 🏫 List All Classes
 */
export const listClasses = async (req, res) => {
    try {
        const { tenantId } = req.user;

        const classes = await prisma.class.findMany({
            where: { tenantId, isActive: true },
            include: {
                _count: {
                    select: {
                        examinations: true,
                        schedules: true,
                    },
                },
            },
            orderBy: [{ name: "asc" }, { section: "asc" }],
        });

        res.json({
            success: true,
            classes,
        });
    } catch (error) {
        console.error("LIST CLASSES ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to fetch classes" });
    }
};

/**
 * 🏫 Get Class Details (with Exams & Schedules)
 */
export const getClassDetails = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;

        const classData = await prisma.class.findFirst({
            where: { id, tenantId },
            include: {
                examinations: {
                    include: {
                        schedules: {
                            orderBy: { examDate: "asc" },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: "Class not found",
            });
        }

        res.json({
            success: true,
            class: classData,
        });
    } catch (error) {
        console.error("GET CLASS DETAILS ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to fetch class details" });
    }
};

/**
 * 🏫 Update Class
 */
export const updateClass = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;
        const data = req.body;

        const existing = await prisma.class.findFirst({
            where: { id, tenantId },
        });

        if (!existing) {
            return res.status(404).json({ success: false, message: "Class not found" });
        }

        delete data.tenantId;
        delete data.id;

        const updatedClass = await prisma.class.update({
            where: { id },
            data,
        });

        res.json({
            success: true,
            message: "Class updated successfully",
            class: updatedClass,
        });
    } catch (error) {
        console.error("UPDATE CLASS ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to update class" });
    }
};

/**
 * 🏫 Delete Class
 */
export const deleteClass = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;

        // Check if class has exams
        const examCount = await prisma.examination.count({
            where: { classId: id, tenantId },
        });

        if (examCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete class that has ${examCount} exam(s) linked. Remove exams first.`,
            });
        }

        const result = await prisma.class.deleteMany({
            where: { id, tenantId },
        });

        if (result.count === 0) {
            return res.status(404).json({ success: false, message: "Class not found" });
        }

        res.json({ success: true, message: "Class deleted successfully" });
    } catch (error) {
        console.error("DELETE CLASS ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to delete class" });
    }
};

/**
 * 🏫 Get Exams by Class ID
 */
export const getExamsByClass = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;

        const exams = await prisma.examination.findMany({
            where: { classId: id, tenantId },
            include: {
                schedules: {
                    orderBy: { examDate: "asc" },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json({
            success: true,
            exams,
        });
    } catch (error) {
        console.error("GET EXAMS BY CLASS ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to fetch exams for class" });
    }
};
