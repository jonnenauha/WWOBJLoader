New OBJLoader prototyping for three.js
===

### 2016-11-06: Status update
- New OBJLoader has almost reached feature parity with the existing OBJLoader
- Features still missing in comparison with existing OBJLoader:
 - Support for Line parsing/geometry generation is missing
 - Multi-Materials are not used, instead a mesh is created per object/group/material designation
- New features:
 - Flag ==createObjectPerSmoothingGroup== will enforce mesh creation per object/group/material/smoothingGroup (default false; as it may lead to thousands of meshes, but useful for experiments)
  - Load from string or arraybuffer
  - Hook for web worker extension "ExtendableMeshCreator" exists already. In non-extended loader it creates meshes and attaches it to the scenegraph group.
- Web worker work has not started, yet, but code base exists from previous proposal!

##### Some thoughts on the code:
Approach is as object oriented as possible: Parsing, raw object creation/data transformation and mesh creation have been encapsulated in classes.

Parsing is done by OBJCodeParser. It processes byte by byte independent of text or arraybuffer input. Chars are transformed to char codes. Differnet line parsers (vertex,normal,uv,face,strings) are responsible for delivering the data retrieved from a single line to the RawObjectBuilder.

The RawObjectBuilder stores raw vertex, normal and uv information and builds output arrays on-the-fly depending on the delivered face information. One input geometry may lead to various output geometry as a raw output arrays are stored currently stored by group and material.

Once a new object is detected from the input, new meshes are created by the ExtendableMeshCreator and the RawObjectBuilder is reset. This is then just a for-loop over the raw objects stored by group_material index.

##### Memory Consumption
Only 60% of the original at peek (150 MB input model) has a peak at  approx. 800MB whereas the existing has a peak at approx. 1300MB in Chrome.

##### Performance
So far, I only ran desktop tests: Firefox is generally faster than Chrome (~125%). 150MB model is loaded in ~6.4 seconds in Firefox and ~8 seconds in Chrome. Existing OBJLoader loader takes 5.1s in Firefox and 5.3s in Chrome.
Tests were performed on: Core i7-6700, 32GB DDR4-2133, 960GTX 4GB, Windows 10 14393.351, Firefox 49 and Chrome Canary 56.
Biggest room for improvement: Assembling a single line and then using a regex to divide it, seems to be faster than evaluating every byte and drawing conclusions. This is not what I expected. I will write a second OBJCodeParser that works differently. From my point of view OO approach is not hindering performance.


##### Examples:
[Existing OBJLoader](http://kaisalmen.de/proto/examples/webgl_loader_objloader_direct.html)

[New OBJLoader](http://kaisalmen.de/proto/examples/webgl_loader_objloader3_direct.html)

Larger model not in the prototype repository (27MB zip):
[Compressed 150MB Model](http://kaisalmen.de//proto/examples/obj/PTV1/PTV1.zip)


### 2016-09-29: Objectives

#### Objectives for new OBJLoader:
- Support different input types for parsing:
 - string
 - arraybuffer
- Low memory usage:
 - Process file content serially and per line
 - Minimize internal data-structure/object usage
- Support inline-processing:
 - Add mesh and material to scene when it becomes available
 - Only intermediate data of current input mesh shall be kept in memory
- Provide hooks for web worker extension
 - Mesh creation shall be isolated within a function
 - Material creation shall be isolated within a function


#### Objectives for web worker wrapper/worker controller:
- Establish lifecycle:
 - init (controller feeds worker)
 - send material information (bi-directional)
 - parse (pass-back buffers)
- Use transferables wherever possible:
 - Construct BufferGeometry on main thread (worker controller)
 - Texture loading must be done on main thread (worker controller). As I understand it the TextureLoader needs document access and web workers are unable to.
- Keep the worker as generic as possible:
 - Already now the WWOBJLoader is not very OBJLoader specific
 - Porting the web worker to other loaders should be straightforward if mesh and material hooks are in loader
- Think about worker management:
 - worker pool (construction cost, device limitations, etc.)

Kai
