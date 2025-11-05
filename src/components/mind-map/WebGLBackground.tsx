/**
 * WebGL Background Component
 * Ported from DLX-Ultra - Provides animated, interactive background
 */

import React, { useRef, useEffect } from 'react';

export interface Point {
  x: number;
  y: number;
}

interface WebGLBackgroundProps {
  selectedNodePosition: Point | null;
  click: { pos: Point; time: number } | null;
}

const vertexShaderSource = `
  attribute vec4 a_position;
  void main() {
    gl_Position = a_position;
  }
`;

const fragmentShaderSource = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_glow_pos;
  uniform vec2 u_click_pos;
  uniform float u_click_time;

  mat2 rotate2d(float angle){
      return mat2(cos(angle),-sin(angle),
                  sin(angle),cos(angle));
  }

  float rand(vec2 n) { 
      return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
  }

  float noise(vec2 p){
      vec2 ip = floor(p);
      vec2 u = fract(p);
      u = u*u*(3.0-2.0*u);
      
      float res = mix(
          mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
          mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
      return res*res;
  }

  void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec3 color = vec3(0.0);

    float t = u_time * 0.05;
    vec2 st_zoom = st * 3.0;
    st_zoom = rotate2d(t * 0.2) * st_zoom;
    float n = noise(st_zoom + t * 0.5);
    color += vec3(0.05, 0.0, 0.1) * n;
    
    vec2 st_zoom2 = st * 5.0;
    st_zoom2 = rotate2d(-t * 0.3) * st_zoom2;
    float n2 = noise(st_zoom2 - t);
    color += vec3(0.0, 0.1, 0.15) * n2 * 0.5;

    if (u_glow_pos.x > 0.0) {
      float dist = distance(st, u_glow_pos);
      float pulse = (sin(u_time * 2.0) + 1.0) * 0.5;
      float glow_radius = 0.15 + pulse * 0.05;
      float glow = smoothstep(glow_radius, 0.0, dist);
      color += glow * vec3(0.1, 0.3, 0.4) * 0.7;
    }

    float timeSinceClick = (u_time * 1000.0 - u_click_time) / 1000.0;
    if (timeSinceClick > 0.0 && timeSinceClick < 2.5) {
        float clickDist = distance(st, u_click_pos);
        float rippleFalloff = smoothstep(0.0, 0.8, timeSinceClick) * smoothstep(2.5, 1.5, timeSinceClick);
        float ripple = sin(clickDist * 50.0 - timeSinceClick * 8.0) * 0.5 + 0.5;
        ripple = pow(ripple, 2.0);
        
        float rippleRing = smoothstep(0.0, 0.02, clickDist - timeSinceClick * 0.2) * smoothstep(0.05, 0.03, clickDist - timeSinceClick * 0.2);
        
        color += rippleRing * rippleFalloff * vec3(0.1, 0.5, 0.7);
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;

const WebGLBackground: React.FC<WebGLBackgroundProps> = ({ selectedNodePosition, click }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const uniformsRef = useRef<{ [key: string]: WebGLUniformLocation | null }>({});
  const animationFrameId = useRef<number | null>(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.warn('WebGL not supported, falling back to static background');
      return;
    }
    glRef.current = gl;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    programRef.current = program;

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    uniformsRef.current = {
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      time: gl.getUniformLocation(program, 'u_time'),
      glow_pos: gl.getUniformLocation(program, 'u_glow_pos'),
      click_pos: gl.getUniformLocation(program, 'u_click_pos'),
      click_time: gl.getUniformLocation(program, 'u_click_time'),
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const render = () => {
      const gl = glRef.current;
      const program = programRef.current;
      const uniforms = uniformsRef.current;
      const canvas = canvasRef.current;

      if (!gl || !program || !canvas) return;

      gl.useProgram(program);

      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.time, (Date.now() - startTime.current) / 1000.0);

      if (selectedNodePosition) {
        gl.uniform2f(uniforms.glow_pos, selectedNodePosition.x / canvas.width, 1.0 - selectedNodePosition.y / canvas.height);
      } else {
        gl.uniform2f(uniforms.glow_pos, -1, -1);
      }

      if (click) {
        gl.uniform2f(uniforms.click_pos, click.pos.x / canvas.width, 1.0 - click.pos.y / canvas.height);
        gl.uniform1f(uniforms.click_time, click.time);
      }

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [selectedNodePosition, click]);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 bg-slate-900" />;
};

export default WebGLBackground;

