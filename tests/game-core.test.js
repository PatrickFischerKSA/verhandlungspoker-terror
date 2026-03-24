const assert = require('assert');
const GameCore = require('../game-core.js');

function pickAllActiveCards(state, preferredCardIds = {}) {
  GameCore.getActiveRoleIds(state).forEach((roleId) => {
    const hand = GameCore.getHandCardsForRole(state, roleId);
    const preferred = preferredCardIds[roleId];
    const chosen = hand.find((card) => card.id === preferred) || hand[0];
    state.selections[roleId] = chosen.id;
  });
}

function testInitialStateScenario() {
  const config = GameCore.createDefaultConfig();
  config.scenarioId = 'frueher_alarm';
  const state = GameCore.createInitialState(config);
  assert.strictEqual(state.resources.evacuation >= 20, true);
  assert.strictEqual(GameCore.getActiveRoleIds(state).length, 6);
}

function testTeachingPresetReducesRoles() {
  const config = GameCore.applyTeachingPreset(GameCore.createDefaultConfig(), 'operativ');
  const state = GameCore.createInitialState(config);
  assert.deepStrictEqual(GameCore.getActiveRoleIds(state), ['katastrophenschutz', 'fuehrungszentrum', 'ministerium', 'koch']);
  assert.strictEqual(GameCore.getMissingSelections(state).length, 4);
}

function testResolveRoundAdvancesAndRebuildsHands() {
  const state = GameCore.createInitialState();
  const beforeRound = state.roundIndex;
  pickAllActiveCards(state);
  const result = GameCore.resolveRound(state);
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.finished, false);
  assert.strictEqual(state.roundIndex, beforeRound + 1);
  assert.strictEqual(state.history.length, 1);
  assert.strictEqual(Object.keys(state.selections).length, 0);
  assert.strictEqual(Array.isArray(state.hands.koch), true);
}

function testShootEndsGame() {
  const state = GameCore.createInitialState();
  state.roundIndex = 9;
  GameCore.updateStatuses(state);
  state.hands = {};
  GameCore.getActiveRoleIds(state).forEach((roleId) => {
    const available = GameCore.getAvailableCardsForRole(state, roleId);
    let hand = available.slice(0, 3);
    if (roleId === 'koch' && !hand.some((card) => card.id === 'shoot')) {
      hand = [available.find((card) => card.id === 'shoot'), ...available.filter((card) => card.id !== 'shoot').slice(0, 2)];
    }
    state.hands[roleId] = hand.map((card) => card.id);
  });
  pickAllActiveCards(state, { koch: 'shoot' });
  const result = GameCore.resolveRound(state);
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.finished, true);
  assert.strictEqual(state.finished, true);
  assert.strictEqual(state.ending.type, 'abschuss');
}

function testInstitutionalFailureVerdict() {
  const state = GameCore.createInitialState();
  state.finished = true;
  state.ending = { type: 'katastrophe', title: 'Katastrophe', summary: '' };
  state.resources.commandConsensus = 2;
  state.matrix.ministerium.omitted = 5;
  state.matrix.fuehrungszentrum.omitted = 4;
  state.matrix.katastrophenschutz.omitted = 3;
  const verdict = GameCore.getVerdict(state);
  assert.strictEqual(verdict.label, 'Institutionelles Versagen');
}

[
  testInitialStateScenario,
  testTeachingPresetReducesRoles,
  testResolveRoundAdvancesAndRebuildsHands,
  testShootEndsGame,
  testInstitutionalFailureVerdict
].forEach((testFn) => testFn());

console.log('All game-core tests passed.');
