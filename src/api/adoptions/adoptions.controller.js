import * as adoptionService from './adoptions.service.js';

export async function requestAdoption(req, res) {
  try {
    const requesterId = req.user.id;
    const { animalId } = req.body;
    const newAdoption = await adoptionService.createRequest(requesterId, animalId);
    res.status(201).json({ message: 'Solicitação de adoção enviada com sucesso!', adoption: newAdoption });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function getSentRequests(req, res) {
  try {
    const requesterId = req.user.id;
    const adoptions = await adoptionService.findSentRequests(requesterId);
    res.status(200).json(adoptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getReceivedRequests(req, res) {
  try {
    const ownerId = req.user.id;
    const adoptions = await adoptionService.findReceivedRequests(ownerId);
    res.status(200).json(adoptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function cancelAdoptionRequest(req, res) {
  // Lógica para cancelar uma solicitação
}

export async function resolveAdoptionRequest(req, res) {
  try {
    const ownerId = req.user.id;
    const { id: adoptionId } = req.params;
    const { status } = req.body; // 'aprovada' ou 'rejeitada'
    await adoptionService.resolveRequest(adoptionId, ownerId, status);
    res.status(200).json({ message: `Solicitação de adoção foi ${status} com sucesso.` });
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
}