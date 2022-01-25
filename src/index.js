/* eslint-disable sort-imports */
/**
 * @namespace platypus
 */
/* global global, navigator, window */

import AssetManager from './AssetManager.js';
import {Debugger} from 'springroll';
import Game from './Game.js';
import config from 'config';
import factory from './factory.js';

// Components
import Interactive from "./components/Interactive.js";
import AIChaser from "./components/AIChaser.js";
import AIPacer from "./components/AIPacer.js";
import AudioMusic from "./components/AudioMusic.js";
import AudioSFX from "./components/AudioSFX.js";
import AudioVO from "./components/AudioVO.js";
import Camera from "./components/Camera.js";
import CameraFollowMe from "./components/CameraFollowMe.js";
import CollisionBasic from "./components/CollisionBasic.js";
import CollisionFilter from "./components/CollisionFilter.js";
import CollisionGroup from "./components/CollisionGroup.js";
import CollisionTiles from "./components/CollisionTiles.js";
import ComponentSwitcher from "./components/ComponentSwitcher.js";
import Counter from "./components/Counter.js";
import EntityContainer from "./components/EntityContainer.js";
import EntityController from "./components/EntityController.js";
import HandlerCollision from "./components/HandlerCollision.js";
import HandlerController from "./components/HandlerController.js";
import HandlerLogic from "./components/HandlerLogic.js";
import HandlerRender from "./components/HandlerRender.js";
import LevelBuilder from "./components/LevelBuilder.js";
import LogicAngularMovement from "./components/LogicAngularMovement.js";
import LogicAttachment from "./components/LogicAttachment.js";
import LogicButton from "./components/LogicButton.js";
import LogicCarrier from "./components/LogicCarrier.js";
import LogicDestroyMe from "./components/LogicDestroyMe.js";
import LogicDirectionalMovement from "./components/LogicDirectionalMovement.js";
import LogicDragDrop from "./components/LogicDragDrop.js";
import LogicImpactLaunch from "./components/LogicImpactLaunch.js";
import LogicPacingPlatform from "./components/LogicPacingPlatform.js";
import LogicPortable from "./components/LogicPortable.js";
import LogicPortal from "./components/LogicPortal.js";
import LogicPushable from "./components/LogicPushable.js";
import LogicRebounder from "./components/LogicRebounder.js";
import LogicRegionSpawner from "./components/LogicRegionSpawner.js";
import LogicRotationalMovement from "./components/LogicRotationalMovement.js";
import LogicSpawner from "./components/LogicSpawner.js";
import LogicStateMachine from "./components/LogicStateMachine.js";
import LogicSwitch from "./components/LogicSwitch.js";
import LogicTeleportee from "./components/LogicTeleportee.js";
import LogicTeleporter from "./components/LogicTeleporter.js";
import LogicTimer from "./components/LogicTimer.js";
import LogicWindUpRacer from "./components/LogicWindUpRacer.js";
import Motion from "./components/Motion.js";
import Mover from "./components/Mover.js";
import Node from "./components/Node.js";
import NodeMap from "./components/NodeMap.js";
import NodeResident from "./components/NodeResident.js";
import Orientation from "./components/Orientation.js";
import RandomEvents from "./components/RandomEvents.js";
import RelativePosition from "./components/RelativePosition.js";
import RelayFamily from "./components/RelayFamily.js";
import RelayGame from "./components/RelayGame.js";
import RelayLinker from "./components/RelayLinker.js";
import RelayParent from "./components/RelayParent.js";
import RelaySelf from "./components/RelaySelf.js";
import RenderAnimator from "./components/RenderAnimator.js";
import RenderContainer from "./components/RenderContainer.js";
import RenderDebug from "./components/RenderDebug.js";
import RenderDestroyMe from "./components/RenderDestroyMe.js";
import RenderProgress from "./components/RenderProgress.js";
import RenderSpine from "./components/RenderSpine.js";
import RenderSprite from "./components/RenderSprite.js";
import RenderText from "./components/RenderText.js";
import RenderTiles from "./components/RenderTiles.js";
import SceneChanger from "./components/SceneChanger.js";
import TiledLoader from "./components/TiledLoader.js";
import Timeline from "./components/Timeline.js";
import Tutorial from "./components/Tutorial.js";
import Tween from "./components/Tween.js";
import VoiceOver from "./components/VoiceOver.js";
import XHR from "./components/XHR.js";

export * from './utils/array.js';
export * from './utils/string.js';
export {default as recycle} from 'recycle';

// Classes
export {default as AABB} from './AABB.js';
export {default as ActionState} from './ActionState.js';
export {Application as Application} from 'springroll';
export {default as Async} from './Async.js';
export {default as CollisionData} from './CollisionData.js';
export {default as CollisionDataContainer} from './CollisionDataContainer.js';
export {default as CollisionShape} from './CollisionShape.js';
export {default as Component} from './Component.js';
export {default as Data} from './Data.js';
export {default as DataMap} from './DataMap.js';
export {default as Entity} from './Entity.js';
export {default as Game} from './Game.js';
export {default as Messenger} from './Messenger.js';
export {default as PIXIAnimation} from './PIXIAnimation.js';
export {default as StateMap} from './StateMap.js';
export {default as Vector} from './Vector.js';

// Component creator
export {default as createComponentClass} from './factory.js';

export default (function () {
    var platypus = global.platypus = {},
        debugWrapper = Debugger ? function (method, ...args) {
            Debugger.log(method, ...args);
        } : function (method, ...args) {
            window.console[method](...args);
        },
        log = config.dev ? debugWrapper : function () {},
        uagent    = navigator.userAgent.toLowerCase(),
        isEdge    = (uagent.search('edge')    > -1),
        isIPod    = (uagent.search('ipod')    > -1),
        isIPhone  = (uagent.search('iphone')  > -1),
        isIPad    = (uagent.search('ipad')    > -1),
        isAndroid = (uagent.search('android') > -1),
        isSilk    = (uagent.search('silk')    > -1),
        isIOS     = isIPod || isIPhone  || isIPad,
        isMobile  = isIOS  || isAndroid || isSilk;

    /**
     * @namespace platypus.components
     * @memberof platypus
     */
    platypus.components = {
        "Interactive": Interactive,
        "AIChaser": AIChaser,
        "AIPacer": AIPacer,
        "AudioMusic": AudioMusic,
        "AudioSFX": AudioSFX,
        "AudioVO": AudioVO,
        "Camera": Camera,
        "CameraFollowMe": CameraFollowMe,
        "CollisionBasic": CollisionBasic,
        "CollisionFilter": CollisionFilter,
        "CollisionGroup": CollisionGroup,
        "CollisionTiles": CollisionTiles,
        "ComponentSwitcher": ComponentSwitcher,
        "Counter": Counter,
        "EntityContainer": EntityContainer,
        "EntityController": EntityController,
        "HandlerCollision": HandlerCollision,
        "HandlerController": HandlerController,
        "HandlerLogic": HandlerLogic,
        "HandlerRender": HandlerRender,
        "LevelBuilder": LevelBuilder,
        "LogicAngularMovement": LogicAngularMovement,
        "LogicAttachment": LogicAttachment,
        "LogicButton": LogicButton,
        "LogicCarrier": LogicCarrier,
        "LogicDestroyMe": LogicDestroyMe,
        "LogicDirectionalMovement": LogicDirectionalMovement,
        "LogicDragDrop": LogicDragDrop,
        "LogicImpactLaunch": LogicImpactLaunch,
        "LogicPacingPlatform": LogicPacingPlatform,
        "LogicPortable": LogicPortable,
        "LogicPortal": LogicPortal,
        "LogicPushable": LogicPushable,
        "LogicRebounder": LogicRebounder,
        "LogicRegionSpawner": LogicRegionSpawner,
        "LogicRotationalMovement": LogicRotationalMovement,
        "LogicSpawner": LogicSpawner,
        "LogicStateMachine": LogicStateMachine,
        "LogicSwitch": LogicSwitch,
        "LogicTeleportee": LogicTeleportee,
        "LogicTeleporter": LogicTeleporter,
        "LogicTimer": LogicTimer,
        "LogicWindUpRacer": LogicWindUpRacer,
        "Motion": Motion,
        "Mover": Mover,
        "Node": Node,
        "NodeMap": NodeMap,
        "NodeResident": NodeResident,
        "Orientation": Orientation,
        "RandomEvents": RandomEvents,
        "RelativePosition": RelativePosition,
        "RelayFamily": RelayFamily,
        "RelayGame": RelayGame,
        "RelayLinker": RelayLinker,
        "RelayParent": RelayParent,
        "RelaySelf": RelaySelf,
        "RenderAnimator": RenderAnimator,
        "RenderContainer": RenderContainer,
        "RenderDebug": RenderDebug,
        "RenderDestroyMe": RenderDestroyMe,
        "RenderProgress": RenderProgress,
        "RenderSpine": RenderSpine,
        "RenderSprite": RenderSprite,
        "RenderText": RenderText,
        "RenderTiles": RenderTiles,
        "SceneChanger": SceneChanger,
        "TiledLoader": TiledLoader,
        "Timeline": Timeline,
        "Tutorial": Tutorial,
        "Tween": Tween,
        "VoiceOver": VoiceOver,
        "XHR": XHR
    };
    platypus.createComponentClass = factory;

    /**
     * This is an object of boolean key/value pairs describing the current browser's properties.
     * @property supports
     * @type Object
     **/
    platypus.supports = {
        touch: (window.ontouchstart !== 'undefined'),
        edge: isEdge,
        iPod: isIPod,
        iPhone: isIPhone,
        iPad: isIPad,
        safari: (uagent.search('safari')  > -1) && !isEdge,
        ie: (uagent.search('msie')    > -1) || (uagent.search('trident') > -1),
        firefox: (uagent.search('firefox') > -1),
        android: isAndroid,
        chrome: (uagent.search('chrome')  > -1) && !isEdge,
        silk: isSilk,
        iOS: isIOS,
        mobile: isMobile,
        desktop: !isMobile
    };
    
    /**
     * This method defines platypus.debug and uses springroll.Debug if available. If springroll.Debug is not loaded, platypus.debug provides inactive stubs for console methods.
     *
     * @property debug
     * @type Object
     */
    platypus.debug = {
        general: log.bind(null, 'log'),
        log: log.bind(null, 'log'),
        warn: log.bind(null, 'warn'),
        debug: log.bind(null, 'debug'),
        error: log.bind(null, 'error'),
        olive: log.bind(null, 'log') // Backwards compatibility - need to deprecate.
    };

    platypus.assetCache = new AssetManager();

    /**
     * The version string for this release.
     * @property version
     * @type String
     * @static
     **/
    platypus.version = config.version;

    /**
     * The build date for this release in UTC format.
     * @property buildDate
     * @type String
     * @static
     **/
    platypus.buildDate = config.buildDate;

    platypus.Game = Game;

    return platypus;
}());