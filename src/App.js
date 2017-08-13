import React, { Component } from 'react';
import './App.css';
import Hammer from 'hammerjs'

import { SketchPicker } from 'react-color'
import reactCSS from 'reactcss'
import tinycolor from 'tinycolor2'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      displayColorPickers: true,
      backgroundColor: "#F8F8F8",
      moonColor: "#111111",
      treeColor: '#111111',
      mtnColor1: "rgb(255, 0, 75)",
      mtnColor2: "rgb(254, 177, 180)",
      mtnColor3: "rgb(0, 85,  170)",
      padding: 50,
      treeWidth: 25,
      moonCount: 2,
      mountainCount: 3,
      running: false,
    }
  }

  componentWillMount () {
    this.updateDimensions()
  }

  updateDimensions () {
    const w = window,
        d = document,
        documentElement = d.documentElement,
        body = d.getElementsByTagName('body')[0]
    
    const width = w.innerWidth || documentElement.clientWidth || body.clientWidth,
        height = w.innerHeight|| documentElement.clientHeight|| body.clientHeight

    //const dim = Math.min(width, height)
    const settings = { width: width, height: height }

    if (width < 500) {
      settings.height = width
      settings.padding = 0
    } else {
      settings.padding = 50
    }

    this.setState(settings)
  }

  componentWillUnmount () {
    window.removeEventListener("resize", this.updateDimensions.bind(this), true)
    window.removeEventListener('keydown', this.handleKeydown.bind(this), true)
    window.clearInterval(this.interval)
  }

  componentDidMount () {
    window.addEventListener("resize", this.updateDimensions.bind(this), true)
    window.addEventListener('keydown', this.handleKeydown.bind(this), true)
    this.interval = window.setInterval(this.tick.bind(this), 400)

    const mc = new Hammer(document, { preventDefault: true })

    mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL })
    mc.get('pinch').set({ enable: true })

    
     mc.on("swipedown", ev => this.incrementMoons())
      .on("swipeup", ev => this.decrementMoons())
      .on("swipeleft", ev => this.incrementMountains())
      .on("swiperight", ev => this.decrementMountains())
      .on("pinchin", ev => { this.incrementMoons(); this.incrementMountains(); this.decrementTreeWidth() } )
      .on("pinchout", ev => { this.decrementMoons(); this.decrementMountains(); this.incrementTreeWidth() })
  }

  handleKeydown (ev) {
    if (ev.which === 67 && !(ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.setState({displayColorPickers: !this.state.displayColorPickers})
    } else if (ev.which === 83 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.handleSave()
    } else if (ev.which === 82 && !(ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.forceUpdate()
    } else if (ev.which === 84) {
      ev.preventDefault()
      this.toggleRun()
    } else if (ev.which === 40 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      //this.decrementStrokeWidth()
    } else if (ev.which === 40) {
      ev.preventDefault()
      this.decrementMoons()
    } else if (ev.which === 38 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      //this.incrementStrokeWidth()
    } else if (ev.which === 38) {
      ev.preventDefault()
      this.incrementMoons()
    } else if (ev.which === 37 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.decrementTreeWidth()
    } else if (ev.which === 37) {
      ev.preventDefault()
      this.decrementMountains()
    } else if (ev.which === 39 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.incrementTreeWidth()
    } else if (ev.which === 39) {
      ev.preventDefault()
      this.incrementMountains()
    }
  }

  incrementMoons () {
    this.setState({moonCount: Math.min(6, this.state.moonCount + 1)})
  }

  decrementMoons () {
    this.setState({moonCount: Math.max(0, this.state.moonCount - 1)})
  }

  incrementMountains () {
    this.setState({mountainCount: Math.min(10, this.state.mountainCount + 1) })
  }

  decrementMountains () {
    this.setState({mountainCount: Math.max(1, this.state.mountainCount - 1) })
  }

  incrementTreeWidth () {
    this.setState({treeWidth: Math.min(50, this.state.treeWidth + 5)})
  }

  decrementTreeWidth () {
    this.setState({treeWidth: Math.max(5, this.state.treeWidth - 5)})
  }

  handleSave () {
    const svgData = document.getElementsByTagName('svg')[0].outerHTML   
    const link = document.createElement('a')
    
    var svgBlob = new Blob([svgData], { type:"image/svg+xml;charset=utf-8" })
    var svgURL = URL.createObjectURL(svgBlob)
    link.href = svgURL 

    link.setAttribute('download', `nature.svg`)
    link.click()
  }

  between (min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
  }

  getActualHeight () {
    return this.state.height-2*this.state.padding
  }

  getActualWidth () {
    return this.state.width-2*this.state.padding
  }

  toggleRun() {
    this.setState({running: !this.state.running})
  }

  tick () {
    if (this.state.running) {
      this.forceUpdate()
    }
  }

  generateTrees () {
    const trees = []

    const actualHeight = this.getActualHeight()
    const actualWidth = this.getActualWidth()
    const treeDistance =  this.state.treeWidth * 2

    for (let i = 0; i < actualWidth/2 - actualWidth/20; i+= treeDistance) {
      trees.push(
        <rect key={i} x={i} y={0} fill={this.state.treeColor}
              height={actualHeight}
              width={this.state.treeWidth} />)
    }

    return trees
  }

  getStrokeWidth() {
    return this.state.treeWidth/10
  }

  terrain(width, height, displace, roughness) {
      var points = [],
          // Gives us a power of 2 based on our width
          power = 128;

      // Set the initial left point
      points[0] = height / 2 + (Math.random() * displace * 2) - displace;
      // set the initial right point
      points[power] = height / 2 + (Math.random() * displace * 2) - displace;
      displace *= roughness;

      // Increase the number of segments
      for (var i = 1; i < power; i *= 2) {
          // Iterate through each segment calculating the center point
          for (var j = (power / i) / 2; j < power; j += power / i) {
              points[j] = ((points[j - (power / i) / 2] + points[j + (power / i) / 2]) / 2);
              points[j] += (Math.random() * displace * 2) - displace
          }
          // reduce our random range
          displace *= roughness;
      }
      return points;
  }

  generateMountains () {
    const mountains = []
    const actualHeight = this.getActualHeight()
    const actualWidth = this.getActualWidth()
    const colors = [ this.state.mtnColor1, this.state.mtnColor2 , this.state.mtnColor3 ]
    const mtnWidth = actualWidth/(this.state.mountainCount-0.5)

    for (let i=0; i < this.state.mountainCount; i ++) {
      const points = this.terrain(mtnWidth, actualHeight, actualHeight/6, 0.2)

      let p = points.map((item, ii) => {
        return `${ii * mtnWidth/points.length + mtnWidth*i}, ${item + 0.5 * item * i/this.state.mountainCount}\n`
      }).reduce(function(a, b) {
        return `${a} ${b}\n`;
      }, `${(i - mtnWidth/this.state.mountainCount) + mtnWidth*i}, ${actualHeight + this.getStrokeWidth()}\n`)

      p += ` ${mtnWidth + mtnWidth/this.state.mountainCount +  mtnWidth*i}, ${actualHeight + this.getStrokeWidth()}\n`

      mountains.push(
        <polygon key={i}
          points={p}
          fill={colors[i % colors.length]}
          strokeWidth={this.getStrokeWidth()}
          stroke={this.state.backgroundColor}
           />
        )
    }

    this.shuffle(mountains)

    return mountains
  }

  shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
  }

  generateMoons () {
    const moons = []
    const circles = []

    const actualHeight = this.getActualHeight()
    const actualWidth = this.getActualWidth()

    for (let i=0; i < this.state.moonCount; i++) {
      let added = false
      let shouldAdd = false
      let count = 0

      while (!added && count < 1000) {
        count++;

        const radius = actualHeight < actualWidth ? this.between(actualHeight/(12*(i + 1)), actualHeight/5) : this.between(actualWidth/(12*(i + 1)), actualWidth/5);
        
        const circ = {
          x: this.between(actualWidth * 0.04 + radius, actualWidth*0.96 - radius) ,
          y: this.between(actualHeight * 0.01 + radius, actualHeight*0.75 - radius) ,
          r: radius
        }

        // no overlaps
        for (let circIndex = 0; circIndex < circles.length; circIndex++) {
          let testCirc = circles[circIndex];
          
          let distanceBetweenCenters = Math.sqrt(
            (testCirc.x - circ.x)*(testCirc.x - circ.x) + (testCirc.y - circ.y)*(testCirc.y - circ.y)
          )

          shouldAdd = distanceBetweenCenters > (testCirc.r + circ.r + this.state.treeWidth)

          if (!shouldAdd) {
            circIndex = circles.length;
          }
        }

        if (shouldAdd || circles.length === 0) {
          circles.push(circ)
          added = true

          moons.push(
            <circle key={i} cx={circ.x}
                    cy={circ.y} r={radius}
                    fill={this.state.moonColor}
                    strokeWidth={this.getStrokeWidth()}
                    stroke={this.state.backgroundColor} />
          )
        }
      }
    }

    return moons
  }

  render() {

    const actualHeight = this.getActualHeight()
    const actualWidth = this.getActualWidth()

    return (
      <div className="App">
       { this.state.displayColorPickers ? <div className="color-pickers">
          <ColorPicker color={tinycolor(this.state.backgroundColor).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({backgroundColor: color.hex}) } />
          <ColorPicker color={tinycolor(this.state.moonColor).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({moonColor: color.hex}) } />
          <ColorPicker color={tinycolor(this.state.treeColor).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({treeColor: color.hex}) } />
          <ColorPicker color={tinycolor(this.state.mtnColor1).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({mtnColor1: color.hex}) } />
          <ColorPicker color={tinycolor(this.state.mtnColor2).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({mtnColor2: color.hex}) } />
          <ColorPicker color={tinycolor(this.state.mtnColor3).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({mtnColor3: color.hex}) } />
            </div> : null
        }

        <div style={{ padding: this.state.padding }}> 
          <svg width={actualWidth} height={actualHeight}>
            <rect width={"100%"} height={"100%"} fill={this.state.backgroundColor} />
            
            <g className='trees' transform={Math.random() > 0.5 ? '' : `translate(${2 * actualWidth/2},0) scale(-1, 1)`} >
              {this.generateTrees()}
            </g>
            
            <g className='mountains'>
              {this.generateMountains()}
            </g>

            <g className='moons'>
              {this.generateMoons()}
            </g>

          </svg>
        </div>
      </div>
    );
  }
}

class ColorPicker extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      color: props.color,
      displayColorPicker: props.displayColorPicker,
      disableAlpha: props.disableAlpha
    }
  }

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false })
    if (this.props.handleClose) {
      this.props.handleClose()
    }
  };

  handleChange = (color) => {
    this.setState({ color: color.rgb })
    this.props.handleChange(color)
  };

  render () {

    const styles = reactCSS({
      'default': {
        color: {
          background: this.state.disableAlpha ?
                `rgb(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b })` :
                `rgba(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b },  ${ this.state.color.a })`,
        },
        popover: {
          position: 'absolute',
          zIndex: '10',
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      },
    })

    return (
      <div className='color-picker'>
        <div className='swatch' onClick={ this.handleClick }>
          <div className='color' style={ styles.color } />
        </div>
        { this.state.displayColorPicker ? <div style={ styles.popover }>
          <div style={ styles.cover } onClick={ this.handleClose }/>
          <SketchPicker color={ this.state.color } onChange={ this.handleChange } disableAlpha={this.state.disableAlpha} />
        </div> : null }
      </div>
    )
  }
}

export default App;
