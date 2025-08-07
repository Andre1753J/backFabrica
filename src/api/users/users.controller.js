import * as userService from './users.service.js';

export async function getUserProfile(req, res) {
  try {
    const userId = req.user.id; // ID do usuário vem do token decodificado
    const userProfile = await userService.getUserProfileById(userId);
    res.status(200).json(userProfile);
  } catch (error) {
    res.status(404).json({ message: error.message }); // 404 Not Found
  }
}

export async function updateUserProfile(req, res) {
  try {
    const userId = req.user.id;
    const updatedData = req.body;
    const { updatedUser, token } = await userService.updateUserProfile(userId, updatedData);
    res.status(200).json({ message: 'Perfil atualizado com sucesso!', user: updatedUser, token });
  } catch (error) {
    res.status(400).json({ message: error.message }); // 400 Bad Request
  }
}

export async function deleteUserProfile(req, res) {
  try {
    const userId = req.user.id;
    await userService.deleteUserProfile(userId);
    res.status(200).json({ message: 'Usuário deletado com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message }); // 500 Internal Server Error
  }
}