import prisma from "../../../../../core/config/db.js";

/**
 * 🏛️ Create Library (Container/Facility)
 */
export const createLibrary = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Library name is required" });
        }

        const library = await prisma.library.create({
            data: {
                tenantId,
                name,
                description,
            },
        });

        res.status(201).json({
            success: true,
            message: "Library created successfully",
            library,
        });
    } catch (error) {
        console.error("CREATE LIBRARY ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 🏛️ List All Libraries
 */
export const listLibraries = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const libraries = await prisma.library.findMany({
            where: { tenantId },
            include: {
                _count: {
                    select: { books: true }
                }
            },
            orderBy: { createdAt: "desc" },
        });

        res.json({
            success: true,
            libraries,
        });
    } catch (error) {
        console.error("LIST LIBRARIES ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to fetch libraries" });
    }
};

/**
 * 🏛️ Update Library Details
 */
export const updateLibrary = async (req, res) => {
    try {
        const { id } = req.params;
        const { tenantId } = req.user;
        const data = req.body;

        const existing = await prisma.library.findFirst({
            where: { id, tenantId }
        });

        if (!existing) {
            return res.status(404).json({ success: false, message: "Library not found" });
        }

        delete data.tenantId;
        delete data.id;

        const library = await prisma.library.update({
            where: { id },
            data,
        });

        res.json({
            success: true,
            message: "Library updated successfully",
            library,
        });
    } catch (error) {
        console.error("UPDATE LIBRARY ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to update library" });
    }
};

/**
 * 🏛️ Delete Library
 */
export const deleteLibrary = async (req, res) => {
    try {
        const { id } = req.params;
        const { tenantId } = req.user;

        // Check if library has books
        const bookCount = await prisma.book.count({
            where: { libraryId: id, tenantId }
        });

        if (bookCount > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete library that contains books. Move or delete books first."
            });
        }

        const result = await prisma.library.deleteMany({
            where: { id, tenantId }
        });

        if (result.count === 0) {
            return res.status(404).json({ success: false, message: "Library not found or already deleted" });
        }

        res.json({ success: true, message: "Library deleted successfully" });
    } catch (error) {
        console.error("DELETE LIBRARY ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to delete library" });
    }
};

/**
 * 🏛️ Get Library Details
 */
export const getLibrary = async (req, res) => {
    try {
        const { id } = req.params;
        const { tenantId } = req.user;

        const library = await prisma.library.findFirst({
            where: { id, tenantId },
            include: {
                _count: {
                    select: { books: true }
                }
            }
        });

        if (!library) {
            return res.status(404).json({ success: false, message: "Library not found" });
        }

        res.json({
            success: true,
            library,
        });
    } catch (error) {
        console.error("GET LIBRARY ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to fetch library" });
    }
};
