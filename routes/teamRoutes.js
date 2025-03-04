const express = require('express');
const router = express.Router();

const teamController = require('../controllers/teamControllers');

router.post('/register',teamController.register);
router.post('/match',teamController.compareLogicGates);
router.get('/count',teamController.registerCount);
router.post('/submit-firstlevel',teamController.submitFirstLevel)
router.post('/submitSecondLevel',teamController.submitSecondLevel)
router.post('/saveSelection',teamController.saveSelection)
router.get('/getSelection/:teamId',teamController.getSelection)
router.get('/getStats',teamController.getStats)
router.get('/get-revealed-card',teamController.getRevealedCard)


module.exports = router;