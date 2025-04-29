import { getDistanceFromLatLonInKm } from '../helper.js';
import User from '../models/UserModel.js';
import { hashPassword, matchPassword, generateToken } from '../utils/auth.js';

export const registerUser = async (req, res) => {
    const { username, password, lat, lng } = req.body;

    try {
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        if (!lat || !lng) return res.status(400).json({ message: 'Location is required' });

        const hashed = await hashPassword(password);


        const user = await User.create({ username, password: hashed });
        const token = generateToken(user._id);
        await User.findByIdAndUpdate(user._id, { token, location: { lat, lng } });

        res.status(201).json({
            _id: user._id,
            username: user.username,
            token,
            location: { lat, lng },
        });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

export const loginUser = async (req, res) => {
    const { username, password, lat, lng } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!lat || !lng) return res.status(400).json({ message: 'Location is required' });

        const isMatch = await matchPassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password or username' });
        }

        const token = generateToken(user._id);
        await User.findByIdAndUpdate(user._id, { token, location: { lat, lng } });

        res.status(200).json({
            _id: user._id,
            username: user.username,
            token,
            location: { lat, lng },
        });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

export const blockUser = async (req, res) => {
    try {

        const { id } = req.params;
        const currentUser = req.user._id;

        if (currentUser.toString() === id) {
            return res.status(400).json({ message: "You cannot block yourself" });
        }

        const user = await User.findById(currentUser);
        if (!user.blockedUsers.includes(id)) {
            user.blockedUsers.push(id);
            await user.save();
            return res.status(200).json({ message: "User blocked successfully" });
        }

        res.status(400).json({ message: "User is already blocked" });
    } catch (error) {
        console.error("Error blocking user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const unblockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user._id;

        const user = await User.findById(currentUser);
        user.blockedUsers = user.blockedUsers.filter(uid => uid.toString() !== id);
        await user.save();

        res.status(200).json({ message: "User unblocked successfully" });
    } catch (error) {
        console.error("Error unblocking user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getNearbyUsers = async (req, res) => {
    try {
        const userId = req.user.id;
        const radiusInKm = parseFloat(req.query.radius) || 5;

        const currentUser = await User.findById(userId, 'location');

        if (!currentUser || !currentUser.location) {
            return res.status(400).json({ message: 'User location not found' });
        }

        const { lat, lng } = currentUser.location;

        const userLocations = await User.find(
            {
                _id: { $ne: userId },
                location: { $ne: null },
                blockedUsers: { $nin: [userId] },
            },
            'location _id username isOnline'
        );

        const nearby = userLocations
            .map((user) => {
                const distance = getDistanceFromLatLonInKm(
                    lat,
                    lng,
                    user.location.lat,
                    user.location.lng
                );

                return {
                    _id: user._id,
                    username: user.username,
                    isOnline: user.isOnline,
                    location: user.location,
                    distance: parseFloat(distance.toFixed(2)),
                };
            })
            .filter((user) => user.distance <= radiusInKm);

        res.status(200).json({ data: nearby, message: 'Nearby users fetched successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching nearby users' });
    }
};

export const updateUserLocation = async (req, res) => {
    try {
        const { lat, lng } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.location = { lat, lng };
        await user.save();

        res.status(200).json({ message: 'Location updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating location' });
    }
};