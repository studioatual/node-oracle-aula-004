class HomeController {
  index(req, res) {
    return res.json({ message: 'Hello World!' });
  }
}

module.exports = new HomeController();
