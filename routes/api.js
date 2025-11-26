const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Balance = require('../models/Balance');
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');

const router = express.Router();

//Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || typeof username !== 'string' || username.trim().length < 3) {
            return res.status(400).json({ status: "Error", message: "Username must be at least 3 characters" });
        }
        if (!password || typeof password !== 'string' || password.length < 6) {
            return res.status(400).json({ status: "Error", message: "Password must be at least 6 characters" });
        }
        if (email && typeof email === 'string') {
            const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
            if (!emailRegex.test(email)) return res.status(400).json({ status: "Error", message: "Invalid email format" });
        }

        const duplicateUsername = await User.findOne({ where: { username } });
        if (duplicateUsername) return res.status(409).json({ status: "Error", message: "Username already taken" });

        const hashPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email, password: hashPassword });
        await Balance.create({ UserId: user.id, username: user.username });

        res.json({ status: "Success", message: "Success Registered" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
});

//User List
router.get('/getUser', async (req, res) =>{
    try {
        const user = await User.findAll({attributes: ['id', 'username', 'email', 'password']});
        res.json({status: "Success", user});
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
})

//Login
router.post('/login', async (req, res) => {
    try {
        const {username, password} = req.body;
        const user = await User.findOne({where: {username} });
        if (!user) return res.status(401).json({ status: "Error", message: "Invalid Username"});
        
        const verifyPassword = await bcrypt.compare(password, user.password);
        if (!verifyPassword) return res.status(401).json({ status: "Error", message: "Invalid Password"});

        const token = await jwt.sign({userId: user.id}, 'secretKey', {expiresIn: '1h'});
        res.json({status: "Success", token, message: "Success Logged In"});
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
});

// Update user
router.put('/updateUser', async (req, res) => {
    try {
        const { id, username, email } = req.body;

        if (!id) return res.status(400).json({ status: "Error", message: "Provide user id" });
        if (!username && !email) return res.status(400).json({ status: "Error", message: "Provide username or email to update" });

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ status: "Error", message: "User not found" });

        const changedUsername = Boolean(username);
        if (changedUsername) user.username = username;
        if (email) user.email = email;

        await user.save();

        if (changedUsername) {
            // Keep Balance.username in sync with User.username
            await Balance.update({ username: user.username }, { where: { UserId: id } });
        }

        res.json({ status: "Success", message: "User updated" });
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Server error" });
    }
});

// Delete user
router.delete('/deleteUser', async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.status(400).json({ status: "Error", message: "Provide user id" });

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ status: "Error", message: "User not found" });

        // Delete balances for this user (if any)
        await Balance.destroy({ where: { UserId: id } });

        // Delete user
        await user.destroy();

        res.json({ status: "Success", message: "User and balance deleted" });
    } catch (err) {
        res.status(500).json({ status: "Error", message: "Server error" });
    }
});

//Check Balance
router.get('/balance', auth, async (req, res) => {
    try {
        const balance = await Balance.findOne({where: {UserId: req.userId}});
        if (!balance) return res.status(404).json({status: "Error", message: "Id Not Found"}); 
       
        res.json({status: "Success", username: balance.username, balance: balance.currBalance});
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
});

//Top up Balance
router.post('/topup', auth, async (req, res) => {
    try {
        const {amount} = req.body;
        if (typeof amount !== 'number' || amount <= 0) return res.status(400).json({status: "Error", message: "Invalid top-up amount"});

        const balance = await Balance.findOne({where: {UserId: req.userId}});
        if (!balance) return res.status(404).json({status: "Error", message: "Id Not Found"});

        balance.currBalance += amount;
        await balance.save();

        res.json({status: "Success", message: "Top-up Successful", balance: balance.currBalance});
    } catch (err) {
        console.error(err);
        res.status(500).json({status: "Error", message: "Server error"});
    }
});

//Transaction
router.post('/transaction', auth, async (req, res) => {
    try {
        const {amount, service} = req.body;

        const balance = await Balance.findOne({ where: { UserId: req.userId } });
        if (!balance) return res.status(404).json({ status: "Error", message: "Id Not Found" });

        // Amount semantics: positive = deposit, negative = withdrawal
        // Ensure sufficient funds for withdrawals
        if (typeof amount !== 'number') return res.status(400).json({ status: "Error", message: "Invalid amount" });
        if (balance.currBalance < amount) {
            return res.status(400).json({ status: "Error", message: "Insufficient Balance" });
        }

        await Transaction.create({ amount, service, trxDate: new Date(), UserId: req.userId });
        balance.currBalance -= amount;
        await balance.save();

        res.json({ status: "Success", message: "Transaction Successful", balance: balance.currBalance });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
});

// Transaction List
router.get('/transactionsList', async (req, res) => {
    try {
        const transactions = await Transaction.findAll({ attributes: ['UserId', 'amount', 'service', 'trxDate'] });
        res.json({ status: 'Success', transactions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'Error', message: 'Server error' });
    }
});

module.exports = router;