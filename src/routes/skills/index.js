// routes/skills/index.js
const { Router } = require("express");
const logger = require("../../services/logger");
const Skills = require("../../database/models/skills");
const UserSkill = require("../../database/models/userSkills");

const SkillsRouter = Router();

// Route zum Abrufen aller verfügbaren Skills
SkillsRouter.get("/all", async (req, res) => {
    try {
        const skills = await Skills.findAll();
        if (skills.length === 0) {
            logger.info("Es gibt keine Skills in der Datenbank."); 
            res.status(200).json([]); // Leeres Array zurückgeben, wenn keine Skills vorhanden sind
        } else {
            logger.info("Alle Skills gefunden."); 
            res.status(200).json(skills);
        }
    } catch (error) {
        logger.error(`Fehler beim Abrufen der Skills: ${error.message}`); 
        res.status(500).json({ error: error.message });
    }
});


// GET Anfrage byUserId
// GET Anfrage byUserId
SkillsRouter.get("/byUserId/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        const userSkills = await UserSkill.findAll({ where: { user_id: userId } });
        if (userSkills.length === 0) {
            logger.info(`Keine Skills gefunden für Benutzer mit ID ${userId}.`); 
            res.status(200).json([]); // Leeres Array zurückgeben, wenn keine Skills vorhanden sind
        } else {
            logger.info(`Skills gefunden für Benutzer mit ID ${userId}.`); 
            res.status(200).json(userSkills);
        }
    } catch (error) {
        logger.error(`Fehler beim Abrufen der Skills für Benutzer mit ID ${userId}: ${error.message}`); 
        res.status(500).json({ error: error.message });
    }
});

// POST Anfrage zum Hinzufügen eines neuen user_skills
SkillsRouter.post("/add", async (req, res) => {
    try {
        const { userId, skillId, proficiency_level, verified } = req.body;
        
        // Überprüfe, ob das user_skill bereits existiert
        const existingUserSkill = await UserSkill.findOne({ 
            where: { user_id: userId, skill_id: skillId } 
        });
        if (existingUserSkill) {
            logger.error(`Das user_skill für Benutzer mit ID ${userId} und Skill-ID ${skillId} existiert bereits.`);
            return res.status(400).json({ error: `Das user_skill existiert bereits.` });
        }
        
        // Erstelle das neue user_skill
        const newUserSkill = await UserSkill.create({ 
            user_id: userId, 
            skill_id: skillId, 
            proficiency_level, 
            verified 
        });
        logger.info(`Das user_skill für Benutzer mit ID ${userId} und Skill-ID ${skillId} wurde erfolgreich hinzugefügt.`);
        res.status(201).json(newUserSkill);
    } catch (error) {
        logger.error(`Fehler beim Hinzufügen des user_skills: ${error.message}`); 
        res.status(500).json({ error: error.message });
    }
});

// POST Anfrage zum Löschen eines user_skills
SkillsRouter.post("/delete", async (req, res) => {
    try {
        const { userId, skillId } = req.body;

        // Überprüfe, ob das user_skill existiert
        const userSkill = await UserSkill.findOne({ 
            where: { user_id: userId, skill_id: skillId } 
        });
        if (!userSkill) {
            logger.error(`Das user_skill für Benutzer mit ID ${userId} und Skill-ID ${skillId} wurde nicht gefunden.`);
            return res.status(404).json({ error: `Das user_skill wurde nicht gefunden.` });
        }
        
        // Lösche das user_skill
        await userSkill.destroy();
        logger.info(`Das user_skill für Benutzer mit ID ${userId} und Skill-ID ${skillId} wurde erfolgreich gelöscht.`);
        res.status(200).json({ message: `Das user_skill wurde erfolgreich gelöscht für den Benutzer ID: ${userId} .` });
    } catch (error) {
        logger.error(`Fehler beim Löschen des user_skills: ${error.message}`); 
        res.status(500).json({ error: error.message });
    }
});

// PUT Anfrage zum Aktualisieren eines user_skills
SkillsRouter.put("/update", async (req, res) => {
    try {
        const { userId, skillId, proficiency_level, verified } = req.body;
        
        // Überprüfe, ob das user_skill existiert
        const userSkill = await UserSkill.findOne({ 
            where: { user_id: userId, skill_id: skillId } 
        });
        if (!userSkill) {
            logger.error(`Das user_skill für Benutzer mit ID ${userId} und Skill-ID ${skillId} wurde nicht gefunden.`);
            return res.status(404).json({ error: `Das user_skill wurde nicht gefunden.` });
        }
        
        // Aktualisiere das user_skill
        await userSkill.update({ proficiency_level, verified });
        logger.info(`Das user_skill für Benutzer mit ID ${userId} und Skill-ID ${skillId} wurde erfolgreich aktualisiert.`);
        res.status(200).json({ message: `Das user_skill wurde erfolgreich aktualisiert.` });
    } catch (error) {
        logger.error(`Fehler beim Aktualisieren des user_skills: ${error.message}`); 
        res.status(500).json({ error: error.message });
    }
});

module.exports = { SkillsRouter };
