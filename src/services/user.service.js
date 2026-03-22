import { User } from "../models/user.model.js";

class UserService {
  /**
   * Find a single user based on query
   */
  async findUser(query) {
    return User.findOne(query);
  }

  /**
   * Find a user by ID
   */
  async findUserById(id) {
    return User.findById(id);
  }

  /**
   * Get all users based on query and sort options
   */
  async getAllUsers(query = {}, sortOptions = { name: 1 }) {
    return User.find(query).sort(sortOptions);
  }

  /**
   * Create a new user
   */
  async createUser(userData) {
    const user = new User(userData);
    return user.save();
  }

  /**
   * Update a user's details (excludes password)
   */
  async updateUser(userId, updateData) {
    // Prevent updating password and reset tags from this generic update
    if (updateData.password) delete updateData.password;
    if (updateData.resetPasswordOnLogin !== undefined) delete updateData.resetPasswordOnLogin;

    return User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
  }

  /**
   * Update a user's password
   */
  async updatePassword(userId, newPassword, requireReset = false) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    user.password = newPassword;
    user.resetPasswordOnLogin = requireReset; // Reset the tag based on criteria
    return user.save();
  }

  /**
   * Delete a user
   */
  async deleteUser(userId) {
    return User.findByIdAndDelete(userId);
  }
}

export const userService = new UserService();
