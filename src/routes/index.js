const router = require('express').Router();
const mondayRoutes = require('./monday');
const path = require('node:path');

router.use(mondayRoutes);

router.get('/', function (req, res) {
  res.json(getHealth());
});

router.get('*', (req, res) => {
  res.sendFile(path.dirname(path.dirname(path.dirname(__filename)))+'/client/dist/'+'index.html')
});


router.get('/health', function (req, res) {
  res.json(getHealth());
  res.end();
});

function getHealth() {
  return {
    ok: true,
    message: 'Healthy',
  };
}

module.exports = router;
