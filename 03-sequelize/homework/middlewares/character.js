const { Router } = require("express");
const { Op, Character, Role } = require("../db");
const Ability = require("../db/models/Ability");
const router = Router();

router.post("/", async (req, res) => {
  try {
    const { code, name, age, race, hp, mana } = req.body;
    if (!code || !name || !hp || !mana)
      return res.status(404).send("Falta enviar datos obligatorios");

    const newCharacter = await Character.create(req.body);
    res.status(201).send(newCharacter);
  } catch (error) {
    res.status(404).send("Error en alguno de los datos provistos");
  }
});

router.get("/", async (req, res) => {
  const { race, age } = req.query;
  try {
    if (!race && !age) {
      const characters = await Character.findAll();
      return res.status(200).send(characters);
    } else {
      const aux = {};
      if (race) aux["race"] = race;
      if (age) aux["age"] = age;
      const characters = await Character.findAll({ where: aux });
      return res.status(200).send(characters);
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get("/young", async (req, res) => {
  try {
    const youngCharacters = await Character.findAll({
      where: {
        age: { [Op.lt]: 25 },
      },
    });
    res.status(200).send(youngCharacters);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get("/:code", async (req, res) => {
  const { code } = req.params;
  try {
    const character = await Character.findByPk(code);
    if (!character)
      throw new Error(
        `El código ${code} no corresponde a un personaje existente`
      );
    res.status(200).send(character);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

router.put("/:attribute", async (req, res) => {
  const { attribute } = req.params;
  const { value } = req.query;
  try {
    const characters = await Character.update(
      {
        [attribute]: value,
      },
      {
        where: { [attribute]: null },
      }
    );
    res.status(200).send("Personajes actualizados");
  } catch (error) {
    res.status(404).send(error.message);
  }
}); 

router.put("/addAbilities", async (req, res) => {
  const { abilities, codeCharacter } = req.body;

  const newAbilities = await Ability.bulkCreate(abilities);
  const character = await Character.findByPk(codeCharacter);

  character.addAbilities(newAbilities);
});

router.get("/roles/:code", async (req, res) => {
  const { code } = req.params;

  const character = await Character.findByPk(code, {
    include: Role,
  });

  res.status(200).send(character);
});

module.exports = router;
