var stately = require("stately");

exports.control = function() {
    var safeMachine, safeStates = {}
        , cautiousMachine, unsafeStates = {}
        ;

    function makeMachines() {
        safeMachine = stately.define(safeStates);
        cautiousMachine = stately.define(unsafeStates);
    };
    
    function handle(doc) {
        safeMachine.handle(doc);
        cautiousMachine.handle(doc);
    };

    function registerSafeCallback(type, state, cb) {
        safeStates[type] = safeStates[type] || {};
        safeStates[type][state] = cb;
    }

    function registerUnsafeCallback(type, state, cb) {
        // todo this needs expiring lock
        unsafeStates[type] = unsafeStates[type] || {};
        unsafeStates[type][state] = cb;
    }

    return {
        start : makeMachines,
        safe : registerSafeCallback,
        unsafe : registerUnsafeCallback,
        handle : handle
    };
};
