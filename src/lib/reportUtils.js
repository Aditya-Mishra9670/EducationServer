import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import nodemailer from 'nodemailer';
import Course from '../models/course.model.js';
import Review from "../models/review.model.js";
// Configure the email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service provider
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS  // Your email password
    }
});

// Function to send an email
const sendEmail = async (to, subject, body) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        text: body
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}.`);
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
        throw error;
    }
};

// Function to remove content[ Course, User, Educator, Comment]
//It needs to be upadted again for the [course,tutor and video ]specificity. we have to exclude the user from removed entities 
export const removecontent = async (contentId,type) => {
    try {
        if(type === 'Course'){
            const course = await Course.findById(contentId);
            if (!course) {
                console.error(`Course with ID ${contentId} not found.`);
                return;
            }
            await course.remove();
            console.log(`Course with ID ${contentId} removed.`);
        }else if(type =="Video"){
            ///remove video
            //implemented after cloud configration
            //yet to be done
        }else if(type === "User" || type === "Educator"){
            const user = await User.findById(contentId);
            if (!user) {
                console.error(`User with ID ${contentId} not found.`);
                return;
            }
            await user.remove();
            console.log(`User with ID ${contentId} removed.`);
        }else if(type === "Comment"){
            const comment = await Comment.findById(contentId);
            if (!comment) {
                console.error(`Comment with ID ${contentId} not found.`);
                return;
            }
            await comment.remove();
            console.log(`Comment with ID ${contentId} removed.`);
        }else if(type === 'Review'){
            const review = await Review.findById(contentId);
            if (!review) {
                console.error(`Review with ID ${contentId} not found.`);
                return;
            }
            await review.remove();
            console.log(`Review with ID ${contentId} removed.`);
        }
    } catch (error) {
        console.error(`Error removing content with ID ${contentId}:`, error);
        throw error;
    }
};

// Function to notify the owner of the content
export const NotifyOwner = async (idTobeDeleted, message) => {
    try {
        const ownerId = await User.findById(idTobeDeleted);
        const notification = new Notification({
            userId: ownerId,
            message: message,
        });
        await notification.save();
        console.log(`Notification sent to owner with ID ${ownerId}.`);
    } catch (error) {
        console.error(`Error notifying owner with ID ${ownerId}:`, error);
        throw error;
    }
};

// Function to notify the reporter
export const NotifyReporter = async (reporterId, reportId) => {
    try {
        const message = `Your report with ID ${reportId} has been resolved. Thnak you for reporting. Hope you are satisfied with our service`;
        const notification = new Notification({
            userId: reporterId,
            message: message,
        });
        await notification.save();
        console.log(`Notification sent to reporter with ID ${reporterId}.`);
    } catch (error) {
        console.error(`Error notifying reporter with ID ${reporterId}:`, error);
        throw error;
    }
};

// Function to find the owner of the content
export const findOwner = async (idTobeDeleted, type) => {
    try {
        if (type === 'course') {
            const course = await Course.findById(idTobeDeleted);
            if (course) {
                return course.teacherId;
            }
        } else if (type === 'video') {
            const course = await Course.findOne({ 'lectures._id': idTobeDeleted }, { 'lectures.$': 1 });
            if (course) {
                return course.teacherId;
            }
        } else if (type === 'user' || type === 'educator') {
            const user = await User.findById(idTobeDeleted);
            if (user) {
                return user._id;
            }
        }
    } catch (error) {
        console.error(`Error finding owner with ID ${idTobeDeleted}:`, error);
        throw error;
    }
    return null;
};
export const sendMailOwner = async (idTobeDeleted,type,action) => {
    try {
        if(action == "edit"){
            const subject = 'Edit Reported Content';
            const body = 'Your content has been reported. Please review the content and make necessary changes.';

            const Owner = await findOwner(idTobeDeleted,type);
            const ownerEmail = await User.findById(Owner).email;
            await sendEmail(ownerEmail, subject, body);
            console.log(`Email sent to owner at ${ownerEmail}.`);
        }else{
            const subject = 'Content Removed';
            const body = 'Your content has been removed due to a report. Please review the content and make necessary changes.';
            const ownerEmail = (type === 'course' || type === 'video') ? (await Course.findById(idTobeDeleted)).teacherId : (await User.findById(idTobeDeleted)).email;
            await sendEmail(ownerEmail, subject, body);
            console.log(`Email sent to owner at ${ownerEmail}.`);
        }
    } catch (error) {
        console.error(`Error sending email to owner at ${ownerEmail}:`, error);
        throw error;
    }
};

// Function to send an email to the reporter
export const sendMailReporter = async (reporterId, reportId) => {
    try {
        const subject = 'Report Resolved';
        const body = `Your report with ID ${reportId} has been resolved. Thank you for reporting. Hope you are satisfied with our service.`;
        const reporterEmail = (await User.findById(reporterId)).email;
        await sendEmail(reporterEmail, subject, body);
        console.log(`Email sent to reporter at ${reporterEmail}.`);
    } catch (error) {
        console.error(`Error sending email to reporter at ${reporterEmail}:`, error);
        throw error;
    }
};