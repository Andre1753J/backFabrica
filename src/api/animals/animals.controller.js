import * as animalService from './animals.service.js';

export async function createAnimal(req, res) {
  try {
    const ownerId = req.user.id;
    const animalData = req.body;
    const imageFile = req.file; // O arquivo de imagem vem do middleware 'upload'

    const newAnimal = await animalService.create(animalData, ownerId, imageFile);
    res.status(201).json({ message: 'Animal cadastrado com sucesso!', animal: newAnimal });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function getAllAnimals(req, res) {
  try {
    const filters = req.query; // Filtros vêm da URL: ?especie=gato&sexo=femea
    const animals = await animalService.findAll(filters);
    res.status(200).json(animals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getAnimalDetails(req, res) {
  try {
    const { id } = req.params;
    const animal = await animalService.findById(id);
    res.status(200).json(animal);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

export async function deleteAnimal(req, res) {
  try {
    const ownerId = req.user.id;
    const { id: animalId } = req.params;
    await animalService.remove(animalId, ownerId);
    res.status(200).json({ message: 'Animal removido com sucesso.' });
  } catch (error) {
    res.status(403).json({ message: error.message }); // 403 Forbidden (não é o dono)
  }
}