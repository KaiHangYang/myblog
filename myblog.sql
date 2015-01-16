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
INSERT INTO `user_article` VALUES ('907987244','修改方案\n---\n\n1. 刚才看了下发现可以通过把MainHandler和AdminHandler交换来实现\n2. 不过又发现了一点，就是我的客户端是通过MainHandler的post来ajax请求的所以会有些问题。\n2. 所以如果想进行全面的更改需要连带客户端的请求加以改变。\n\n>所以说加油吧\n\n用来测试看看怎么样的\n不知道跪了没\n不知道怎么样呢','1415636373.9','博客修改建议','11.11凌晨我所想到的博客修改方案'),('907987244','在来看看啦\n===\n没事干了；啊','1421386266.67','在来看看啦','尝试着看是不是有问题'),('907987244','终于搭好了\n===\n加油了哈\n还要复习啊，任务还是挺重的呢','1421386695.93','终于搭好了','哈哈，搭好了以后就要继续扩展功能了啊'),('907987244','还有新的想法\n===\n\n把url用`MD5 hash`一下吧','1421386792.37','还有新的想法','想把文章的显示使用MD5做一个hash然后再作为url'),('907987244','终于在iptables的帮助下和一篇博客上找到了方法\n===\n我所说的一篇[博文](http://lyp0909.blog.51cto.com/508999/509408)讲的还不错呢。','1421407892.17','终于在iptables的帮助下和一篇博客上找到了方法','反向代理实现的防止别人通过端口访问'),('907987244','下来就是我想要的那个东西了～～\n===\n试试','1421408112.72','下来就是我想要的那个东西了～～','试下网页截图啦～');
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

-- Dump completed on 2015-01-16  9:16:23
