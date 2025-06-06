-- MySQL dump 10.13  Distrib 8.0.42, for Linux (aarch64)
--
-- Host: localhost    Database: fi37_schulze_fpadw
-- ------------------------------------------------------
-- Server version	8.0.42-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `benutzer`
--

DROP TABLE IF EXISTS `benutzer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `benutzer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `passwort` varchar(255) NOT NULL,
  `profilbild_url` varchar(255) DEFAULT NULL,
  `beschreibung` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `benutzer`
--

LOCK TABLES `benutzer` WRITE;
/*!40000 ALTER TABLE `benutzer` DISABLE KEYS */;
INSERT INTO `benutzer` VALUES (1,'Test User','test@example.com','$2b$12$VuUwl3wy1AKv/55uVV2t7.ZgSDufmGIl93ttgzVJL/xuaeUCWqJZu',NULL,NULL,'2025-05-31 14:23:13'),(2,'Test User','test2@example.com','$2b$12$tfeIrB.gVrPzYK8v7Xaw0.U5lxG1xAm3k4yeluz2SAaiucS81K51K',NULL,NULL,'2025-05-31 14:35:01'),(3,'silvana','silvanaschulze87@gmail.com','$2b$12$F.CTE9MUTopXyFZvhAFiHOOuRWSSo/qMUybSvsRCellOFMwCJCZxm',NULL,NULL,'2025-05-31 19:07:17'),(4,'silvana','sillvanaschulze87@gmail.com','$2b$12$XK3mQGchAi.0Gfe00AKoXeraV9sJvUfE1/dWnT0Pnl.cwHjXKjmSW',NULL,NULL,'2025-05-31 19:19:47'),(5,'ana','ana@email.com','$2b$12$xlU3OSSv2XJbff7EhbjVa.sgESUIrpGJ0eO.LxkGM.Nw8GqwGZgOy','static/profile_images/profile_5.avif',NULL,'2025-06-01 16:37:13'),(7,'Test User','test@test.com','$2b$12$UkdCEtcWf.KSEQRK.v6QRuJQXPdhGYm9e3Ptt4wR9rfYsauIxdS0G',NULL,NULL,'2025-06-02 12:20:55'),(8,'ana1','ana1@email.com','$2b$12$KJpcQ5yjh.I7uvc1tn5UyuSk5bWgsUCxmLmCuOociE0WCwY8RB.ZK',NULL,NULL,'2025-06-02 16:40:54'),(9,'sara','sara@email.com','$2b$12$xIg13wMFp1OfUl/vzYR1b.M1U5gHDOcs.vE0KbkHj3fzK338BvJeW','static/profile_images/profile_9.avif',NULL,'2025-06-04 11:01:26'),(10,'casa','casa@email.com','$2b$12$C7FkzAa89dL9S98ezXHpl./RtoxBhplKIyPHThrtzaPcMB3R.3VL6','static/profile_images/profile_10.jpeg',NULL,'2025-06-05 07:24:20');
/*!40000 ALTER TABLE `benutzer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bewertungen`
--

DROP TABLE IF EXISTS `bewertungen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bewertungen` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rezept_id` int NOT NULL,
  `benutzer_id` int NOT NULL,
  `bewertung` int NOT NULL,
  `erstellungsdatum` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `aktualisierungsdatum` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_recipe_rating` (`rezept_id`,`benutzer_id`),
  KEY `benutzer_id` (`benutzer_id`),
  CONSTRAINT `bewertungen_ibfk_1` FOREIGN KEY (`rezept_id`) REFERENCES `rezepte` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bewertungen_ibfk_2` FOREIGN KEY (`benutzer_id`) REFERENCES `benutzer` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bewertungen_chk_1` CHECK (((`bewertung` >= 1) and (`bewertung` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bewertungen`
--

LOCK TABLES `bewertungen` WRITE;
/*!40000 ALTER TABLE `bewertungen` DISABLE KEYS */;
INSERT INTO `bewertungen` VALUES (1,3,5,3,'2025-06-03 13:53:09','2025-06-03 13:53:19'),(5,13,9,3,'2025-06-04 11:01:57','2025-06-04 11:01:57');
/*!40000 ALTER TABLE `bewertungen` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favoriten`
--

DROP TABLE IF EXISTS `favoriten`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favoriten` (
  `benutzer_id` int NOT NULL,
  `rezept_id` int NOT NULL,
  PRIMARY KEY (`benutzer_id`,`rezept_id`),
  KEY `rezept_id` (`rezept_id`),
  CONSTRAINT `favoriten_ibfk_1` FOREIGN KEY (`benutzer_id`) REFERENCES `benutzer` (`id`) ON DELETE CASCADE,
  CONSTRAINT `favoriten_ibfk_2` FOREIGN KEY (`rezept_id`) REFERENCES `rezepte` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favoriten`
--

LOCK TABLES `favoriten` WRITE;
/*!40000 ALTER TABLE `favoriten` DISABLE KEYS */;
INSERT INTO `favoriten` VALUES (1,1),(2,1),(8,2),(8,3),(5,13),(9,13);
/*!40000 ALTER TABLE `favoriten` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kategorien`
--

DROP TABLE IF EXISTS `kategorien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kategorien` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `beschreibung` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kategorien`
--

LOCK TABLES `kategorien` WRITE;
/*!40000 ALTER TABLE `kategorien` DISABLE KEYS */;
INSERT INTO `kategorien` VALUES (2,'Vorspeise','Appetizers and starters'),(3,'Hauptgericht','Main dishes and entrees'),(4,'Nachspeise','Desserts and sweet treats'),(5,'Snack','Small bites and appetizers'),(6,'Alkoholfreie Getränke','Non-alcoholic beverages'),(7,'Alkoholische Getränke','Alcoholic beverages');
/*!40000 ALTER TABLE `kategorien` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kommentare`
--

DROP TABLE IF EXISTS `kommentare`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kommentare` (
  `id` int NOT NULL AUTO_INCREMENT,
  `benutzer_id` int NOT NULL,
  `rezept_id` int NOT NULL,
  `text` text NOT NULL,
  `erstellt_am` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `aktualisiert_am` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `benutzer_id` (`benutzer_id`),
  KEY `rezept_id` (`rezept_id`),
  CONSTRAINT `kommentare_ibfk_1` FOREIGN KEY (`benutzer_id`) REFERENCES `benutzer` (`id`) ON DELETE CASCADE,
  CONSTRAINT `kommentare_ibfk_2` FOREIGN KEY (`rezept_id`) REFERENCES `rezepte` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kommentare`
--

LOCK TABLES `kommentare` WRITE;
/*!40000 ALTER TABLE `kommentare` DISABLE KEYS */;
INSERT INTO `kommentare` VALUES (1,1,1,'Sehr lecker! Ich habe es gestern ausprobiert.','2025-05-31 14:27:18','2025-06-03 13:45:29'),(2,4,1,'muito bom','2025-05-31 19:21:20','2025-06-03 13:45:29'),(4,5,3,'lecker','2025-06-02 12:29:51','2025-06-03 13:45:29'),(7,5,3,'boa','2025-06-02 15:57:55','2025-06-03 13:45:29'),(10,8,3,'oi','2025-06-02 16:42:46','2025-06-03 13:45:29'),(11,5,3,'sehr lecker','2025-06-03 13:53:20','2025-06-03 13:53:19'),(12,9,13,'sehr einfach!','2025-06-04 11:01:58','2025-06-04 11:01:57');
/*!40000 ALTER TABLE `kommentare` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `passwort_reset`
--

DROP TABLE IF EXISTS `passwort_reset`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `passwort_reset` (
  `id` int NOT NULL AUTO_INCREMENT,
  `benutzer_id` int NOT NULL,
  `token` varchar(255) NOT NULL,
  `ablauf` datetime NOT NULL,
  `erstellt_am` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_token` (`token`),
  UNIQUE KEY `unique_benutzer` (`benutzer_id`),
  CONSTRAINT `passwort_reset_ibfk_1` FOREIGN KEY (`benutzer_id`) REFERENCES `benutzer` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `passwort_reset`
--

LOCK TABLES `passwort_reset` WRITE;
/*!40000 ALTER TABLE `passwort_reset` DISABLE KEYS */;
INSERT INTO `passwort_reset` VALUES (3,3,'btJI-NcHWXjtYDQbH2ah1UsHEIj5vWasVsXFKkdzI9A','2025-06-01 17:42:23','2025-06-01 16:42:22');
/*!40000 ALTER TABLE `passwort_reset` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rezept_kategorien`
--

DROP TABLE IF EXISTS `rezept_kategorien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rezept_kategorien` (
  `rezept_id` int NOT NULL,
  `kategorie_id` int NOT NULL,
  PRIMARY KEY (`rezept_id`,`kategorie_id`),
  KEY `kategorie_id` (`kategorie_id`),
  CONSTRAINT `rezept_kategorien_ibfk_1` FOREIGN KEY (`rezept_id`) REFERENCES `rezepte` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rezept_kategorien_ibfk_2` FOREIGN KEY (`kategorie_id`) REFERENCES `kategorien` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rezept_kategorien`
--

LOCK TABLES `rezept_kategorien` WRITE;
/*!40000 ALTER TABLE `rezept_kategorien` DISABLE KEYS */;
/*!40000 ALTER TABLE `rezept_kategorien` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rezepte`
--

DROP TABLE IF EXISTS `rezepte`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rezepte` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titel` varchar(200) NOT NULL,
  `zutaten` text NOT NULL,
  `zubereitung` text NOT NULL,
  `benutzer_id` int NOT NULL,
  `bild_pfad` varchar(255) DEFAULT NULL,
  `kategorie_id` int DEFAULT NULL,
  `erstellungsdatum` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `benutzer_id` (`benutzer_id`),
  CONSTRAINT `rezepte_ibfk_1` FOREIGN KEY (`benutzer_id`) REFERENCES `benutzer` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rezepte`
--

LOCK TABLES `rezepte` WRITE;
/*!40000 ALTER TABLE `rezepte` DISABLE KEYS */;
INSERT INTO `rezepte` VALUES (1,'Kartoffelsalat','[{\"name\": \"Kartoffeln\", \"menge\": \"1kg\"}, {\"name\": \"Mayonnaise\", \"menge\": \"200g\"}, {\"name\": \"Zwiebeln\", \"menge\": \"2\"}]','1. Kartoffeln kochen\n2. Zwiebeln schneiden\n3. Alles mischen',1,'e5aa0e39-a3a5-46b2-b2a3-08d16e5baed3_kartoffelsalat.jpg',1,'2025-05-31 14:27:00'),(2,'Teste Receita','[{\"zutat\": \"Teste\", \"menge\": \"1\", \"einheit\": \"kg\"}]','Instruções de teste',1,'25901f15-a36c-473d-97f4-0cfaa83f3ccb_teste_receita.jpg',1,'2025-06-02 12:13:40'),(3,'Pizza Margherita','[{\"name\": \"Tomate\", \"menge\": \"2\", \"einheit\": \"St\\u00fcck\"}]','Den Teig ausrollen und mit Tomaten und Mozzarella belegen. Bei 220°C 15 Minuten backen.',1,'d7241840-9c4c-4454-a716-a1d5ca77f39a_pizza_margherita.jpg',1,'2025-06-02 12:16:04'),(10,'Klassischer Mojito','[{\"name\": \"Wei\\u00dfer Rum\", \"menge\": \"60\", \"einheit\": \"ml\"}, {\"name\": \"Limetten\", \"menge\": \"1\", \"einheit\": \"St\\u00fcck\"}, {\"name\": \"Rohrzucker\", \"menge\": \"2\", \"einheit\": \"TL\"}, {\"name\": \"Frische Minze\", \"menge\": \"10\", \"einheit\": \"Bl\\u00e4tter\"}, {\"name\": \"Mineralwasser\", \"menge\": \"120\", \"einheit\": \"ml\"}, {\"name\": \"Crushed Ice\", \"menge\": \"1\", \"einheit\": \"Tasse\"}, {\"name\": \"Angostura Bitter\", \"menge\": \"3\", \"einheit\": \"Tropfen\"}]','1. Die Limette in 8 Spalten schneiden.\n\n2. Limettenspalten und Rohrzucker in ein hohes Glas geben.\n\n3. Mit einem Muddler oder Holzlöffel die Limetten leicht andrücken, um den Saft zu extrahieren.\n\n4. Minzblätter dazugeben und vorsichtig andrücken (nicht zerdrücken, nur die Öle freisetzen).\n\n5. Das Glas mit Crushed Ice füllen.\n\n6. Weißen Rum hinzugeben und gut umrühren.\n\n7. Mit Mineralwasser auffüllen.\n\n8. Nochmals vorsichtig umrühren.\n\n9. Mit einem Minzzweig und einer Limettenscheibe garnieren.\n\n10. Mit einem Strohhalm servieren.\n\nVariante: Für einen fruchtigen Twist gefrorene Beeren hinzufügen.',1,'06fe6531-5d87-4165-95d8-a5ee20930344_klassischer_mojito.jpg',7,'2025-06-03 15:53:34'),(11,'Spaghetti Carbonara','[{\"name\": \"Spaghetti\", \"menge\": \"400\", \"einheit\": \"g\"}, {\"name\": \"Pancetta oder Guanciale\", \"menge\": \"150\", \"einheit\": \"g\"}, {\"name\": \"Eier\", \"menge\": \"4\", \"einheit\": \"St\\u00fcck\"}, {\"name\": \"Pecorino Romano\", \"menge\": \"100\", \"einheit\": \"g\"}, {\"name\": \"Schwarzer Pfeffer\", \"menge\": \"1\", \"einheit\": \"TL\"}, {\"name\": \"Salz\", \"menge\": \"1\", \"einheit\": \"Prise\"}, {\"name\": \"Oliven\\u00f6l\", \"menge\": \"2\", \"einheit\": \"EL\"}]','1. Einen großen Topf mit Salzwasser zum Kochen bringen und die Spaghetti nach Packungsanweisung al dente kochen.\n\n2. Pancetta in kleine Würfel schneiden und in einer großen Pfanne ohne Öl bei mittlerer Hitze goldbraun braten.\n\n3. In einer Schüssel die Eier mit dem geriebenen Pecorino und frisch gemahlenem schwarzen Pfeffer verquirlen.\n\n4. Die al dente gekochten Spaghetti abgießen, dabei eine Tasse Nudelwasser aufbewahren.\n\n5. Die heißen Spaghetti sofort zur Pancetta in die Pfanne geben und vom Herd nehmen.\n\n6. Die Ei-Käse-Mischung schnell unter die Nudeln rühren. Bei Bedarf etwas Nudelwasser hinzufügen für eine cremige Konsistenz.\n\n7. Sofort servieren, mit extra Pecorino und schwarzem Pfeffer bestreuen.\n\nWichtig: Die Pfanne sollte nicht zu heiß sein, damit die Eier nicht gerinnen!',1,'bcad3bfb-e6bb-463c-a016-9577e9a2e2a9_spaghetti_carbonara.jpg',3,'2025-06-03 15:53:34'),(12,'Tiramisu','[{\"name\": \"L\\u00f6ffelbiskuits\", \"menge\": \"300\", \"einheit\": \"g\"}, {\"name\": \"Mascarpone\", \"menge\": \"500\", \"einheit\": \"g\"}, {\"name\": \"Eier\", \"menge\": \"4\", \"einheit\": \"St\\u00fcck\"}, {\"name\": \"Zucker\", \"menge\": \"100\", \"einheit\": \"g\"}, {\"name\": \"Starker Espresso\", \"menge\": \"300\", \"einheit\": \"ml\"}, {\"name\": \"Kakaopulver\", \"menge\": \"2\", \"einheit\": \"EL\"}, {\"name\": \"Amaretto\", \"menge\": \"3\", \"einheit\": \"EL\"}, {\"name\": \"Dunkle Schokolade\", \"menge\": \"50\", \"einheit\": \"g\"}]','1. Den Espresso kochen und mit Amaretto mischen. Abkühlen lassen.\n\n2. Eigelb und Zucker in einer Schüssel schaumig schlagen, bis die Masse hell und cremig ist.\n\n3. Mascarpone portionsweise unterrühren bis eine glatte Creme entsteht.\n\n4. Eiweiß steif schlagen und vorsichtig unter die Mascarpone-Creme heben.\n\n5. Die Löffelbiskuits kurz in den Espresso tauchen und in eine Form legen (erste Schicht).\n\n6. Die Hälfte der Mascarpone-Creme darauf verteilen.\n\n7. Diesen Vorgang wiederholen: Biskuits, dann restliche Creme.\n\n8. Das Tiramisu mindestens 4 Stunden, besser über Nacht, im Kühlschrank ziehen lassen.\n\n9. Vor dem Servieren mit Kakaopulver bestäuben und mit geraspelter Schokolade garnieren.\n\nTipp: Das Tiramisu schmeckt am besten, wenn es einen Tag lang durchgezogen ist.',1,'d70e4f05-e383-439c-a2b8-8a7e23bde106_tiramisu.jpg',4,'2025-06-03 15:53:34'),(13,'Bruschetta alla Pomodoro','[{\"name\": \"Baguette oder Ciabatta\", \"menge\": \"1\", \"einheit\": \"St\\u00fcck\"}, {\"name\": \"Tomaten\", \"menge\": \"4\", \"einheit\": \"St\\u00fcck\"}, {\"name\": \"Knoblauch\", \"menge\": \"3\", \"einheit\": \"Zehen\"}, {\"name\": \"Basilikum\", \"menge\": \"1\", \"einheit\": \"Bund\"}, {\"name\": \"Oliven\\u00f6l extra vergine\", \"menge\": \"4\", \"einheit\": \"EL\"}, {\"name\": \"Balsamico-Essig\", \"menge\": \"1\", \"einheit\": \"EL\"}, {\"name\": \"Salz\", \"menge\": \"1\", \"einheit\": \"TL\"}, {\"name\": \"Schwarzer Pfeffer\", \"menge\": \"1\", \"einheit\": \"Prise\"}]','1. Das Brot in 1,5 cm dicke Scheiben schneiden und goldbraun rösten (Grill, Pfanne oder Toaster).\n\n2. Tomaten waschen, Stielansatz entfernen und in kleine Würfel schneiden.\n\n3. Knoblauch schälen und fein hacken.\n\n4. Basilikumblätter waschen, trocknen und in Streifen schneiden.\n\n5. Tomaten, Knoblauch und Basilikum in einer Schüssel mischen.\n\n6. Mit Olivenöl, Balsamico, Salz und Pfeffer würzen und 15 Minuten ziehen lassen.\n\n7. Die gerösteten Brotscheiben mit einer halbierten Knoblauchzehe einreiben.\n\n8. Die Tomatenmischung großzügig auf die Brotscheiben verteilen.\n\n9. Sofort servieren, damit das Brot nicht aufweicht.\n\nVariante: Mit Mozzarella oder gerösteten Pinienkernen verfeinern.',1,'551111fe-1152-44f3-be7b-2101920e0d50_bruschetta_alla_pomodoro.jpg',5,'2025-06-03 15:53:35'),(14,'Klassischer Caesar Salad','[{\"name\": \"R\\u00f6mersalat\", \"menge\": \"2\", \"einheit\": \"K\\u00f6pfe\"}, {\"name\": \"Parmesan\", \"menge\": \"100\", \"einheit\": \"g\"}, {\"name\": \"Croutons\", \"menge\": \"1\", \"einheit\": \"Tasse\"}, {\"name\": \"Mayonnaise\", \"menge\": \"3\", \"einheit\": \"EL\"}, {\"name\": \"Worcestershire-Sauce\", \"menge\": \"1\", \"einheit\": \"TL\"}, {\"name\": \"Knoblauch\", \"menge\": \"2\", \"einheit\": \"Zehen\"}, {\"name\": \"Zitronensaft\", \"menge\": \"2\", \"einheit\": \"EL\"}, {\"name\": \"Oliven\\u00f6l\", \"menge\": \"3\", \"einheit\": \"EL\"}, {\"name\": \"Sardellen\", \"menge\": \"4\", \"einheit\": \"St\\u00fcck\"}]','1. Den Römersalat waschen, trockenschleudern und in mundgerechte Stücke zupfen.\n\n2. Für das Dressing: Knoblauch fein hacken und mit Sardellen zu einer Paste zerdrücken.\n\n3. Mayonnaise, Worcestershire-Sauce, Zitronensaft und Olivenöl unterrühren.\n\n4. Den Salat mit dem Dressing vermengen und mit frisch geriebenem Parmesan bestreuen.\n\n5. Mit Croutons garnieren und sofort servieren.\n\nTipp: Das Dressing kann auch mit einem rohen Ei zubereitet werden für ein authentischeres Ergebnis.',1,'2288c37a-bb9b-4127-a909-e5abf5213135_klassischer_caesar_salad.jpg',2,'2025-06-03 15:53:35');
/*!40000 ALTER TABLE `rezepte` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-05 17:59:57
