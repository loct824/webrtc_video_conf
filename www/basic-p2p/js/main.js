/***
 * Excerpted from "Programming WebRTC",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit https://pragprog.com/titles/ksrtc for more book information.
***/
'use strict';

class VideoFX {
  constructor(){
    this.filters = ['grayscale', 'sepia', 'noir', 'psychedelic', 'none']
  }

  cycleFilter(){
    const filter = this.filters.shift()
    this.filters.push(filter)
    return filter 
  }
}

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
  resetPeer($peer)
}

/**
 *  Global Variables: $self and $peer
 */

// $self is for configuration of self video & audio set-up
const $self = {
  rtcConfig: null,
  isPolite: false,
  isMakingOffer : false,
  isIgnoringOffer: false,
  isSettingRemoteAnswerPending: false,
  mediaConstraints: {audio: false, video: true}
}

const $peer = {
  connection: new RTCPeerConnection($self.rtcConfig),
}





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

requestSelfMedia($self.mediaConstraints)
$self.filters = new VideoFX()
document.querySelector('#self').addEventListener('click', (e)=>{
  const filter = `filter-${$self.filters.cycleFilter()}`
  e.target.className = filter;
})



/**
 *  User-Interface Functions and Callbacks
 */



/**
 *  User-Media Functions
 */

async function requestSelfMedia(mediaConstraints){
  $self.stream = new MediaStream() // a stream is a container of tracks
  $self.media = await navigator.mediaDevices.getUserMedia(mediaConstraints) // getUserMedia() returns a stream which contains tracks from the devices

  $self.stream.addTrack($self.media.getTracks()[0]) // add the first track , which is the video , to the stream container

  //lastly points the self video element's source to the set up stream
  document.querySelector('#self').srcObject = $self.stream
}

function addStreamingMedia(stream, peer){
  if (stream){
    for (let track of stream.getTracks()){
      peer.connection.addTrack(track, stream)
    }
  }
}



/**
 *  Call Features & Reset Functions
 */

function establishCallFeatures(peer){
  // must register call backs before adding any media tracks to the peer's connection,
  // otherwise, the negotiationneeded event will be fired without executing a callback
  registerRtcCallbacks(peer)
  addStreamingMedia($self.stream, peer)
}

function resetPeer(peer){
  document.querySelector('#peer').srcObject = null
  peer.connection.close()
  peer.connection = new RTCPeerConnection($self.rtcConfig)
}



/**
 *  WebRTC Functions and Callbacks
 */

function registerRtcCallbacks(peer){
  peer.connection.onnegotiationneeded = handleRtcConnectionNegotiation
  peer.connection.onicecandidate = handleRtcIceCandidate
  peer.connection.ontrack = handleRtcPeerTrack
}

function handleRtcPeerTrack({track, streams: [stream]}){
  console.log('Attempt to display media from peer...')
  document.querySelector('#peer').srcObject = stream
}



/**
 * =========================================================================
 *  End Application-Specific Code
 * =========================================================================
 */



/**
 *  Reusable WebRTC Functions and Callbacks
 */

async function handleRtcConnectionNegotiation(){
  $self.isMakingOffer = true;
  console.log('Attempting to make an offer...')
  await $peer.connection.setLocalDescription()
  sc.emit('signal', {description: $peer.connection.localDescription})
  $self.isMakingOffer = false
}

function handleRtcIceCandidate({ candidate}){
  console.log('Attempting to handle an ICE candidate')
  sc.emit('signal', {candidate: candidate} )
}

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
  establishCallFeatures($peer)
}

const handleScConnectedPeer = ()=>{
  console.log("connected with peer.")
  $self.isPolite = true // set self to be polite when peer is connected
}

const handleScDisconnectedPeer = ()=>{
  console.log("disconnected from peer.  ")
  resetPeer($peer)
  establishCallFeatures($peer)
}

async function handleScSignal({description, candidate}){
  console.log("socket signal")
  if (description) {
    // work with an incoming description (offer/answer)
    const ready_for_offer = !$self.isMakingOffer &&
                            ($peer.connection.signalingState === 'stable' || $self.isSettingRemoteAnswerPending)

    const offer_collision = description.type === 'offer' && !ready_for_offer;

    $self.isIgnoringOffer = !$self.isPolite && offer_collision

    if ($self.isIgnoringOffer){
      return
    }

    $self.isSettingRemoteAnswerPending = description.type === 'answer'
    await $peer.connection.setRemoteDescription(description)
    $self.isSettingRemoteAnswerPending = false;

    if (description.type ==='offer'){
      await $peer.connection.setLocalDescription();
      sc.emit('signal', { description: $peer.connection.localDescription});
    }
  } else if (candidate) {
    // work with an incoming ICE candidate, ICE stands for Interactive Connectivity Establishment
    try {
      await $peer.connection.addIceCandidate(candidate)
    } catch (e){
      if (!$self.isIgnoringOffer && candidate.candidate.length > 1){
        console.error('Unable to add ICE candidate for peer:', e)
      }
    }
  }
}


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

/**
 * Main flow
 */

registerScCallbacks()
const namespace = prepareNamespace(window.location.hash,true)
/** signalling channel set up */
const sc = io.connect('/'+ namespace, { autoConnect: false})
document.querySelector('#header h1').innerHTML=`Welcome to room #${namespace}`
document.querySelector('#call-button').addEventListener('click', callButtonOnClick)