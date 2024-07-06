//Clases

class Persona {
    constructor(id, nombre, apellido, fechaNacimiento) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.fechaNacimiento = fechaNacimiento;
    }
    toString() {
        return "ID: " + this.id + ", Nombre: " + this.nombre + ", Apellido: " + this.apellido + ", Fecha de Nacimiento: " + this.fechaNacimiento;
    }
}

class Ciudadano extends Persona {
    constructor(id, nombre, apellido, fechaNacimiento, dni) {
        super(id, nombre, apellido, fechaNacimiento);
        this.dni = dni;
    }
    toString() {
        return super.toString() + ", DNI: " + this.dni;
    }
}

class Extranjero extends Persona {
    constructor(id, nombre, apellido, fechaNacimiento, paisOrigen) {
        super(id, nombre, apellido, fechaNacimiento);
        this.paisOrigen = paisOrigen;
    }
    toString() {
        return super.toString() + ", Pais Origen: " + this.paisOrigen;
    }
}

//listaAPI
let dataJSON;
//lista para guardar el array
let listaPersonasObj = [];


//function para cargar data de JSON
function cargarDatos() {
    try {
        dataJSON.forEach((persona) => {
            if (persona.dni) {
                let ciudadanoNew = new Ciudadano(
                    persona.id,
                    persona.nombre,
                    persona.apellido,
                    persona.fechaNacimiento,
                    persona.dni
                );
                listaPersonasObj.push(ciudadanoNew);
            } else if (persona.paisOrigen) {
                let extranjeroNew = new Extranjero(
                    persona.id,
                    persona.nombre,
                    persona.apellido,
                    persona.fechaNacimiento,
                    persona.paisOrigen
                );
                listaPersonasObj.push(extranjeroNew);
            }
        });
        console.log(listaPersonasObj);
        cargarTabla(listaPersonasObj);
    } catch (error) {
        alert("Ocurrio un error");
    }
    finally {
        ocultarSpinner();
    }
}

//Function para cargar la tabla
function cargarTabla(listaPersonasObj) {
    let tbody = document.getElementById("dataTable");
    tbody.innerHTML = "";

    listaPersonasObj.forEach((persona) => {
        let trData = document.createElement("tr");
        trData.setAttribute("id", "fila-" + persona.id);

        let tdID = document.createElement("td");
        tdID.textContent = persona.id;
        trData.appendChild(tdID);

        let tdNombre = document.createElement("td");
        tdNombre.textContent = persona.nombre;
        trData.appendChild(tdNombre);

        let tdApellido = document.createElement("td");
        tdApellido.textContent = persona.apellido;
        trData.appendChild(tdApellido);

        let tdFechaNacimiento = document.createElement("td");
        tdFechaNacimiento.textContent = persona.fechaNacimiento;
        trData.appendChild(tdFechaNacimiento);

        let tdDni = document.createElement("td");
        tdDni.textContent = isEmpty(persona.dni) ? "N/A" : persona.dni;
        trData.appendChild(tdDni);

        let tdPaisOrigen = document.createElement("td");
        tdPaisOrigen.textContent = isEmpty(persona.paisOrigen) ? "N/A" : persona.paisOrigen;
        trData.appendChild(tdPaisOrigen);

        let tdModificar = document.createElement("td");
        let btnModificar = document.createElement("button");
        btnModificar.textContent = "Modificar";
        btnModificar.addEventListener('click', function () {
            modificarPersona(persona.id);
        });
        tdModificar.appendChild(btnModificar);
        trData.appendChild(tdModificar);

        let tdEliminar = document.createElement("td");
        let btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.addEventListener('click', function () {
            eliminarPersona(persona.id);
        });
        tdEliminar.appendChild(btnEliminar);
        trData.appendChild(tdEliminar);

        tbody.appendChild(trData);
    });
}

//#region API
//Obtener data de API
function obtenerListaPersonaAPI() {
    let http = new XMLHttpRequest();
    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            dataJSON = JSON.parse(http.response);
            cargarDatos();
        }
        else {
            if (http.readyState == 4) {
                alert("Ocurrio un problema en la red");
            }
        }
    }
    http.open("GET", "https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero", false);
    http.send();
}

async function cargarPersonaAPI(persona) {
    mostrarSpinner();

    let personaSinId = {
        nombre: persona.nombre,
        apellido: persona.apellido,
        fechaNacimiento: persona.fechaNacimiento,
        dni: persona.dni,
        paisOrigen: persona.paisOrigen
    };

    let url = 'https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero';
    let headers = {
        'Content-Type': 'application/json'
    };

    try {
        let response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(personaSinId)
        });

        if (!response.ok) {
            throw new Error('No se pudo realizar la operación.');
        }

        let data = await response.json();
        let nuevoId = data.id;
        persona.id = nuevoId;

        listaPersonasObj.push(persona);
        cargarTabla(listaPersonasObj);

        ocultarSpinner();

        return persona;
    } catch (error) {
        console.error('Error en la solicitud:', error);
        ocultarSpinner();
        throw error;
    }
    finally {
        ocultarSpinner();
    }
}

function modificarPersonaAPI(persona) {
    return new Promise((resolve, reject) => {
        mostrarSpinner();

        let url = `https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero`;
        let headers = {
            'Content-Type': 'application/json'
        };

        let personaUpdate = {
            id: persona.id,
            nombre: persona.nombre,
            apellido: persona.apellido,
            fechaNacimiento: persona.fechaNacimiento
        };

        if (persona instanceof Ciudadano) {
            personaUpdate.dni = persona.dni;
        } else if (persona instanceof Extranjero) {
            personaUpdate.paisOrigen = persona.paisOrigen;
        }

        fetch(url, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(personaUpdate)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('No se pudo realizar la operación.');
                }
                resolve();
                modificarPersonaArray(personaUpdate);
                limpiarFormABM();
                retornarFormDatos();
            })
            .catch(error => {
                reject(error);
                limpiarFormABM();
                retornarFormDatos();
                alert("Ocurrio un error al modificar persona");
            })
            .finally(() => {
                ocultarSpinner();
            });
    });
}
function eliminarPersonaAPI(idPersona) {
    return new Promise((resolve, reject) => {
        mostrarSpinner();

        let url = `https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero`;
        let headers = {
            'Content-Type': 'application/json'
        };

        let personaDelete = {
            id: idPersona,
        };

        fetch(url, {
                method: 'DELETE',
                headers: headers,
                body: JSON.stringify(personaDelete)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('No se pudo realizar la operación.');
                }
                resolve();
                eliminarPersonaArray(idPersona);
                limpiarFormABM();
                retornarFormDatos();
            })
            .catch(error => {
                reject(error);
                limpiarFormABM();
                retornarFormDatos();
                alert("Ocurrio un error al eliminar persona");
            })
            .finally(() => {
                ocultarSpinner();
            });
    });
}



//#endregion
function agregarPersona() {
    if (validarDatosIngresados()) {
        let persona;
        let id = 0;
        let nombre = document.getElementById("nombreNew").value;
        let apellido = document.getElementById("apellidoNew").value;
        let fechaNacimiento = document.getElementById("fechaNacimientoNew").value;
        let tipoNew = document.getElementById("tipoNew").value;
        let dni = document.getElementById("dniNew").value;
        let paisOrigen = document.getElementById("paisNew").value;

        if (tipoNew === "ciudadano") {
            persona = new Ciudadano(id, nombre, apellido, fechaNacimiento, dni);
        }
        else if (tipoNew === "extranjero") {
            persona = new Extranjero(id, nombre, apellido, fechaNacimiento, paisOrigen);
        }

        cargarPersonaAPI(persona)
            .then(personaActualizada => {
                limpiarFormABM();
                retornarFormDatos();
                alert("Se agregó correctamente");
            })
            .catch(error => {
                console.error('Error al procesar la solicitud:', error);
                limpiarFormABM();
                retornarFormDatos();
                alert("No se pudo agregar la persona.");
            });
    }
    else {
        alert("No ingreso los campos correspondientes");
    }
}


function validarDatosIngresados() {
    let datosValidos = false;
    let nombre = document.getElementById("nombreNew").value;
    let apellido = document.getElementById("apellidoNew").value;
    let fechaNacimiento = document.getElementById("fechaNacimientoNew").value;
    let tipoNew = document.getElementById("tipoNew").value;
    let dni = document.getElementById("dniNew").value;
    let paisOrigen = document.getElementById("paisNew").value;

    if (esValido(nombre) && esValido(apellido) && esValido(fechaNacimiento) && esValido(tipoNew)) {
        if (tipoNew === "ciudadano") {
            datosValidos = esValido(dni);
        }
        else if (tipoNew === "extranjero") {
            datosValidos = esValido(paisOrigen);
        }
    }
    return datosValidos;
}

function retornarFormDatos() {
    limpiarFormABM();
    document.getElementById("FormABM").style.display = "none";
    document.getElementById("FormDatos").style.display = "block";
}

function mostrarFormularioABM(edicion) {
    document.getElementById("FormABM").style.display = "block";
    document.getElementById("FormDatos").style.display = "none";
    bloquearCampoUnico();
    if (edicion) {
        document.getElementById("botonCrear").style.display = "none";
        document.getElementById("botonModificar").style.display = "inline";
    }
    else {
        document.getElementById("botonCrear").style.display = "inline";
        document.getElementById("botonModificar").style.display = "none";
        document.getElementById("tipoNew").disabled = false;
    }
}

function limpiarFormABM() {
    document.getElementById("idPersona").value = "";
    document.getElementById("nombreNew").value = "";
    document.getElementById("apellidoNew").value = "";
    document.getElementById("fechaNacimientoNew").value = "";
    document.getElementById("tipoNew").value = "";
    document.getElementById("dniNew").value = "";
    document.getElementById("paisNew").value = "";
}

function modificarPersona(id) {
    mostrarFormularioABM(true);
    let persona;
    if (id > 0) {
        persona = listaPersonasObj.find(persona => persona.id === id);
        cargarFormABM(persona);
    }
}
function modificarPersonaDatos() {
    if (validarDatosIngresados()) {
        let persona;
        let id = document.getElementById("idPersona").value;
        let nombre = document.getElementById("nombreNew").value;
        let apellido = document.getElementById("apellidoNew").value;
        let fechaNacimiento = document.getElementById("fechaNacimientoNew").value;
        let tipoNew = document.getElementById("tipoNew").value;
        let dni = document.getElementById("dniNew").value;
        let paisOrigen = document.getElementById("paisNew").value;

        if (tipoNew === "ciudadano") {
            persona = new Ciudadano(id, nombre, apellido, fechaNacimiento, dni);
        }
        else if (tipoNew === "extranjero") {
            persona = new Extranjero(id, nombre, apellido, fechaNacimiento, paisOrigen);
        }

        modificarPersonaAPI(persona);

    }
    else {
        alert("No ingreso los campos correspondientes");
    }
}
function modificarPersonaArray(personaUpdate){
    personaModificar = listaPersonasObj.find((persona) => persona.id == personaUpdate.id);

    if (personaModificar != null) {
        personaModificar.nombre = personaUpdate.nombre;
        personaModificar.apellido = personaUpdate.apellido;
        personaModificar.fechaNacimiento = personaUpdate.fechaNacimiento;
        personaModificar.dni = personaUpdate.dni;
        personaModificar.paisOrigen = personaUpdate.paisOrigen;
        alert("Se modifico el ID:" + personaUpdate.id);
        cargarTabla(listaPersonasObj);
        retornarFormDatos();
    }
    else {
        alert("No se encontro el ID")
    }
}
function cargarFormABM(persona) {
    document.getElementById("idPersona").value = persona.id;
    document.getElementById("nombreNew").value = persona.nombre;
    document.getElementById("apellidoNew").value = persona.apellido;
    document.getElementById("fechaNacimientoNew").value = persona.fechaNacimiento;
    if (persona instanceof Ciudadano) {
        document.getElementById("tipoNew").value = "ciudadano";
        document.getElementById("dniNew").value = persona.dni;
        document.getElementById("tipoNew").disabled = true;
        document.getElementById("paisNew").disabled = true;
        document.getElementById("dniNew").disabled = false;
    }
    else {
        document.getElementById("tipoNew").value = "extranjero";
        document.getElementById("paisNew").value = persona.paisOrigen;
        document.getElementById("tipoNew").disabled = true;
        document.getElementById("dniNew").disabled = true;
        document.getElementById("paisNew").disabled = false;
    }
}

function bloquearCampoUnico() {
    let valor = document.getElementById("tipoNew").value;
    if (valor === "ciudadano") {
        document.getElementById("dniNew").disabled = false;
        document.getElementById("paisNew").disabled = true;
    }
    else {
        document.getElementById("paisNew").disabled = false;
        document.getElementById("dniNew").disabled = true;
    }
}

function eliminarPersona(idPersona) {
    respuesta = confirm("Desea eliminar?");
    if (idPersona > 0 && respuesta) {
        eliminarPersonaAPI(idPersona);
    }
    else
    {
        retornarFormDatos();
    }
}

function eliminarPersonaArray(idPersona)
{
    if (idPersona > 0) {
        listaPersonasObj = listaPersonasObj.filter(persona => persona.id != idPersona);
        alert("Se elimino el ID:" + idPersona);
        cargarTabla(listaPersonasObj);
        retornarFormDatos();
    }
    else
    {
        retornarFormDatos();
    }
}

//spinner
function mostrarSpinner() {
    document.getElementById('spinner').style.display = 'flex';
}

function ocultarSpinner() {
    document.getElementById('spinner').style.display = 'none';
}

//Funciones adicionales
function isEmpty(str) {
    return (!str || str.length === 0 || undefined);
}

function esValido(valor) {
    return valor !== null && valor.trim() !== "";
}
