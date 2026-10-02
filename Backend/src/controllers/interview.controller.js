const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")




/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {

    try {

        console.log("========== INTERVIEW REQUEST ==========")
        console.log("BODY:", req.body)
        console.log("FILE:", req.file)

        const { selfDescription, jobDescription } = req.body

        // Job description is required
        if (!jobDescription || !jobDescription.trim()) {
            return res.status(400).json({
                message: "Job description is required."
            })
        }

        // Resume OR self-description is required
        if (!req.file && (!selfDescription || !selfDescription.trim())) {
            return res.status(400).json({
                message: "Please upload a resume or provide a self-description."
            })
        }

        // Resume is optional
        let resumeText = ""

        // Only parse PDF when a resume was actually uploaded
        if (req.file) {

            if (req.file.mimetype !== "application/pdf") {
                return res.status(400).json({
                    message: "Only PDF resumes are supported."
                })
            }

            const resumeContent = await (
                new pdfParse.PDFParse(
                    Uint8Array.from(req.file.buffer)
                )
            ).getText()

            resumeText = resumeContent.text || ""
        }

        console.log("Resume text length:", resumeText.length)
        console.log(
            "Self description length:",
            selfDescription?.length || 0
        )

        // Generate AI interview report
        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription: selfDescription || "",
            jobDescription
        })

        // Save report
        const interviewReport = await interviewReportModel.create({
            user: req.user.userId,
            resume: resumeText,
            selfDescription: selfDescription || "",
            jobDescription,
            ...interViewReportByAi
        })

        return res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })

    } catch (error) {

        console.error(
            "Error generating interview report:",
            error
        )

        return res.status(500).json({
            message: "Failed to generate interview report.",
            error: error.message
        })
    }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.userId })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.userId }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findById(interviewReportId)

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}

module.exports = { generateInterViewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController }