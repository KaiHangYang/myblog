-- MySQL dump 10.13  Distrib 5.5.40, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: blog
-- ------------------------------------------------------
-- Server version	5.5.40-0ubuntu0.14.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `account` varchar(12) NOT NULL DEFAULT '',
  `password` varchar(32) DEFAULT NULL,
  `Email` varchar(25) DEFAULT NULL,
  `Admin` int(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`account`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('907987244','6bef68407afc93ec8d800edaeed3d55b','y907987244@gmail.com',1);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_article`
--

DROP TABLE IF EXISTS `user_article`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_article` (
  `account` varchar(12) NOT NULL,
  `article` text,
  `timestamp` varchar(15) NOT NULL,
  `title` varchar(30) NOT NULL,
  `brief_intro` varchar(100) NOT NULL,
  KEY `account` (`account`),
  CONSTRAINT `user_article_ibfk_1` FOREIGN KEY (`account`) REFERENCES `user` (`account`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_article`
--

LOCK TABLES `user_article` WRITE;
/*!40000 ALTER TABLE `user_article` DISABLE KEYS */;
INSERT INTO `user_article` VALUES ('907987244','声明\n===\n\n    class haha():\n        def cc():\n            pass','1421581601.86','声明','下面的东西全是胡乱写的不要介意哈'),('907987244','哭了，代码没push直接rm掉了\n===\n\n有时间得把代码重构了。没事，重写吧，还可以.....','1421591624.46','哭了，代码没push直接rm掉了','现在的代码只是跑在内存里的代码````'),('907987244','差不多了哈哈\n===\n\n>事件绑定完了以后就在加上一个评论功能哈哈','1421591689.8','差不多了哈哈','下来就是把事件绑定上去然后'),('907987244','我是不是很作死啊`\n===\n明天开始玩命复习啊啊啊啊啊','1421592836.66','我是不是很作死啊`','哈哈啊哈哈'),('907987244','蛋疼的图片布局问题\n===\n\n图片的加载确实是一个蛋疼的问题，不过我好想想到了一个好的主意我试试哈','1421595483.94','蛋疼的图片布局问题','暂时用setinterval来做个掩饰了'),('907987244','wt-item的高度问题\n===\n\n**我觉得可以手动把里面的高度计算出来**','1421595738.69','wt-item的高度问题','不能够直接求container的高度'),('907987244','复习去了\n===\n赶紧复习去啦','1421625944.11','复习去了','这几天就不写了，要考试了，否则要跪');
/*!40000 ALTER TABLE `user_article` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-01-19  3:23:46
