-- MySQL dump 10.13  Distrib 8.0.31, for Win64 (x86_64)
--
-- Host: 200.129.130.149    Database: petsworld_db
-- ------------------------------------------------------
-- Server version	8.4.4

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `animal`
--

DROP TABLE IF EXISTS `animal`;
CREATE TABLE `animal` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dt_nascimento` date DEFAULT NULL,
  `doador` int NOT NULL,
  `adotador` int DEFAULT NULL,
  `nome` varchar(256) DEFAULT NULL,
  `sexo` enum('M','F') DEFAULT NULL,
  `disponivel` boolean DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `castrado` boolean DEFAULT NULL,
  `vacinado` boolean DEFAULT NULL,
  `vermifugado` boolean DEFAULT NULL,
  `idEspecie` int NOT NULL,
  `idRaca` int NOT NULL,
  `idCor` int NOT NULL,
  `idPorte` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `doador` (`doador`),
  KEY `adotador` (`adotador`),
  KEY `idEspecie` (`idEspecie`),
  KEY `idRaca` (`idRaca`),
  KEY `idCor` (`idCor`),
  KEY `idPorte` (`idPorte`),
  CONSTRAINT `animal_ibfk_1` FOREIGN KEY (`doador`) REFERENCES `cliente` (`id`),
  CONSTRAINT `animal_ibfk_2` FOREIGN KEY (`adotador`) REFERENCES `cliente` (`id`),
  CONSTRAINT `animal_ibfk_3` FOREIGN KEY (`idEspecie`) REFERENCES `Especie` (`idEspecie`),
  CONSTRAINT `animal_ibfk_4` FOREIGN KEY (`idRaca`) REFERENCES `Raca` (`idRaca`),
  CONSTRAINT `animal_ibfk_5` FOREIGN KEY (`idCor`) REFERENCES `Cor` (`idCor`),
  CONSTRAINT `animal_ibfk_6` FOREIGN KEY (`idPorte`) REFERENCES `Porte` (`idPorte`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-17 16:32:20
