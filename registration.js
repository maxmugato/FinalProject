// Import database connection module
const db = require('../services/db'); // Import your database connection module

class Registration {
    
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }

    
    async addRegistration() {
        try {
            const sql = "INSERT INTO registration (username, password) VALUES (?, ?)";
            const result = await db.query(sql, [this.username, this.password]);
            return result;
        } catch (error) {
            console.error("Error adding registration:", error.message);
            throw error;
        }
    }

    
    async checkUsernameExists() {
        try {
            
            const sql = "SELECT COUNT(*) AS count FROM registration WHERE username = ?";
            
           
            const result = await db.query(sql, [this.username]);

           
            const count = result[0].count;

           
            return count > 0;
        } catch (error) {
            
            console.error("Error checking username:", error.message);
            throw error; 
        }
    }
}

// Export the Registration class to be used in other modules
module.exports = Registration;
