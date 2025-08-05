/***
 * Excerpted from "Programming WebRTC",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit https://pragprog.com/titles/ksrtc for more book information.
***/
'use strict';

const callButtonOnClick = (event)=>{
  const button = event.target
  if (button.className === 'join'){
    button.className = 'leave'
    button.innerHTML = 'Leave Call'
    joinCall()
  } 
  else if (button.className ==='leave'){
    button.className = 'join'
    button.innerHTML = 'Join Call'
    leaveCall()
  }
}

const joinCall = ()=>{
  sc.open()
}

const leaveCall = ()=>{
  sc.close()
}

const namespace = prepareNamespace(window.location.hash,true)

document.querySelector('#header h1').innerHTML=`Welcome to room #${namespace}`
document.querySelector('#call-button').addEventListener('click', callButtonOnClick)

/**
 *  Global Variables: $self and $peer
 */

// $self is for configuration of self video & audio set-up


/**
 *  Signaling-Channel Setup
 */

const sc = io.connect('/'+ namespace, { autoConnect: false})



/**
 * =========================================================================
 *  Begin Application-Specific Code
 * =========================================================================
 */



/**
 *  User-Interface Setup
 */



/**
 *  User-Media Setup
 */



/**
 *  User-Interface Functions and Callbacks
 */



/**
 *  User-Media Functions
 */



/**
 *  Call Features & Reset Functions
 */



/**
 *  WebRTC Functions and Callbacks
 */



/**
 * =========================================================================
 *  End Application-Specific Code
 * =========================================================================
 */



/**
 *  Reusable WebRTC Functions and Callbacks
 */



/**
 *  Signaling-Channel Functions and Callbacks
 */

function registerScCallbacks(){
  sc.on('connect', handleScConnect)
  sc.on('connected peer', handleScConnectedPeer)
  sc.on('disconnected peer', handleScDisconnectedPeer)
  sc.on('signal', handleScSignal)
} 

const handleScConnect = ()=>{
  console.log("connected to signaling channel.  ")
}

const handleScConnectedPeer = ()=>{
  console.log("connected with peer.")
}

const handleScDisconnectedPeer = ()=>{
  console.log("disconnected from peer.  ")
}

const handleScSignal = ()=>{
  console.log("socket signal")
}

registerScCallbacks()


/**
 *  Utility Functions
 */

function prepareNamespace(hash, set_location){
  let ns = hash.replace(/^#/,'');
  if (/^[0-9]{7}/.test(ns)){
    console.log('Checked existing namspace', ns)
    return ns
  }
  ns = Math.random().toString().substring(2,9)
  console.log('created new namespace', ns)
  if (set_location) window.location.hash = ns;
  return ns;
}