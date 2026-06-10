<script setup>
import { db } from "@/firebase";
import { CountryService } from '@/service/CountryService';
import { NodeService } from '@/service/NodeService';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, getDocs, query, Timestamp, updateDoc, where } from "firebase/firestore";
import { useToast } from "primevue/usetoast";
import { onMounted, ref, watch } from 'vue';


const auth = getAuth();
const usuario = auth.currentUser;
const toast = useToast();
const isButtonDisabled = ref(false);
const autoValue = ref(null);
const autoFilteredValue = ref([]);
const certificadoSeleccionado = ref(""); // <-- Aquí guardarás el certificado que selecciones
const certificadosDisponibles = ref([]); // <-- Aquí cargarás los certificados del foliosRango
const lineaSeleccionada = ref('Linea 1'); 
const camposOpcionales = ['Telefono', 'Gmail', 'Multa', 'NoAlta', 'FechaAlta', 'Referencia2', 'Referencia', 'Linea', 'FechaPago', 'NoSerie']; // Puedes agregar más campos aquí si deseas

const year = ref(null);
const gmail = ref("");
const listCredito = ref([
    { name: 'Efectivo'},
    { name: 'Credito'},
    { name: 'Transferencia'},
    { name: 'Tarjeta'}
]);

const listUso = ref([
    { name: 'Anual'},
    { name: 'Semestral'},
    { name: 'Cuatrimestral'}
]);

const listCombustible = ref([
    { name: 'Gasolina'},
    { name: 'Disel'},
    { name: 'Gas Natural'}
]);

const listMulta = ref([
  'Pago Pendiente','Pagada','N/A'
]);

const listLineas = ref(['Linea 1', 'Linea 2']);
const listboxValue = ref(null);
const listEstados = ref([
  'Aguascalientes','Foraneos', 'Extranjeros'
]);

const currentYear = new Date().getFullYear();
const listAno = ref([]);
for (let year = currentYear - 99; year <= currentYear; year++) {
    listAno.value.push({ name: year.toString() });
}

const treeSelectNodes = ref(null);

const cantidadCredito = ref("");
const certificadoOK = ref(false);
const combustible = ref("");
const costo = ref("");
const estado = ref("");
const fechaAlta = ref("");
const fechaPago = ref("");
const fechaRegistro = ref("");
const multa = ref("");
const noSerie = ref("");
const nombreCliente = ref("");
const nota = ref("");
const placa = ref("");
const referencia = ref("");
const uso = ref("");
const federal = ref(false);
const linea = ref("");
const NoAlta = ref("");
const referencia2 = ref("");
const telefono = ref('');
const estatusMulta = ref('');

onMounted(async () => {
    CountryService.getCountries().then((data) => (autoValue.value = data));
    NodeService.getTreeNodes().then((data) => (treeSelectNodes.value = data));
    await cargarCertificados(); // <-- Cargar los certificados disponibles al montar
});

function formatearTelefono(e) {
  let valor = e.target.value.replace(/\D/g, ''); // Eliminar todo lo que no sea número
  // Formatear como XXX-XXX-XX-XX
  if (valor.length > 0) {
    if (valor.length <= 3) {
      valor = valor;
    } else if (valor.length <= 6) {
      valor = `${valor.slice(0, 3)}-${valor.slice(3)}`;
    } else if (valor.length <= 8) {
      valor = `${valor.slice(0, 3)}-${valor.slice(3, 6)}-${valor.slice(6)}`;
    } else {
      valor = `${valor.slice(0, 3)}-${valor.slice(3, 6)}-${valor.slice(6, 8)}-${valor.slice(8, 10)}`;
    }
  }
  telefono.value = valor;
}
// Función que deseas ejecutar cuando cambie el valor de `linea`
const funcionCuandoCambiaLinea = (nuevaLinea) => {
  console.log('La línea seleccionada es:', nuevaLinea);
  // Aquí puedes agregar la lógica que quieras ejecutar cuando cambia el valor del select
};

// Función para cargar certificados dependiendo de la línea seleccionada
async function cargarCertificados() {
  try {
    // Definir la colección en base a la línea seleccionada
    const foliosRef = collection(db, linea.value === 'Linea 1' ? 'foliosLinea1' : 'foliosLinea2');
    const q = query(foliosRef, where("Utilizado", "==", false));  // Filtramos los no utilizados
    const querySnapshot = await getDocs(q);

    // Actualizar la lista de certificados disponibles
    certificadosDisponibles.value = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        label: data.NumeroFolio,   // Mostrar el NumeroFolio
        value: data.NumeroFolio    // También guardar el NumeroFolio
      };
    });

  } catch (error) {
    console.error("Error al cargar certificados:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "❌ Error al cargar certificados disponibles.",
      life: 3000,
    });
  }
}

// Usar un watch para observar el cambio de `linea` y ejecutar la función
watch(linea, () => {
  cargarCertificados();  // Llamamos a la función cada vez que cambia la selección de linea
});

watch(estatusMulta, (nuevoValor) => {
  if (nuevoValor !== 'Pago Pendiente') {
    noSerie.value = '';
  }
});

const limpiarCampos = async () => {
  // Resetear campos del formulario
  cantidadCredito.value = null;
  certificadoSeleccionado.value = null;
  certificadoOK.value = false;
  combustible.value = null;
  costo.value = null;
  estado.value = null;
  fechaAlta.value = null;
  fechaPago.value = null;
  fechaRegistro.value = null;
  estatusMulta.value = null;
  multa.value = null;
  NodeService.value = null;
  nombreCliente.value = '';
  nota.value = '';
  placa.value = '';
  referencia.value = '';
  referencia2.value = '';
  uso.value = null;
  year.value = null;
  gmail.value = '';
  linea.value = '';
  NoAlta.value = '';
  telefono.value = '';

  isButtonDisabled.value = false;

  // ✅ Volver a cargar los folios disponibles
  await cargarCertificados(); // Asegúrate de tener esta función definida
};

const guardarVehiculo = async () => {
  isButtonDisabled.value = true;
  const docRef = doc(db, "usuarios", usuario.uid); // "usuarios" es el nombre de la colección
  const docSnap = await getDoc(docRef);
  
  const datos = {
    CantidadCredito: cantidadCredito.value?.name || null,
    Certificado: certificadoSeleccionado.value || null,
    CertificadoOk: certificadoOK.value,
    Combustible: combustible.value?.name || null,
    Costo: costo.value ? Number(costo.value) : null,
    Estado: estado.value || null,
    FechaAlta: fechaAlta.value,
    FechaPago: fechaPago.value,
    FechaRegistro: fechaRegistro.value ? Timestamp.fromDate(new Date(fechaRegistro.value)) : Timestamp.now(),
    Multa: multa.value,
    NoSerie: noSerie.value,
    estatusMulta: estatusMulta.value,
    NombreCliente: nombreCliente.value || null,
    Nota: nota.value || null,
    Placa: placa.value || null,
    Referencia: referencia.value || null,
    Referencia2: referencia2.value || null,
    Uso: uso.value?.name || null,
    Year: year.value?.name ? Number(year.value.name) : null,
    Gmail: gmail.value || null,
    Linea: linea.value || null,
    NoAlta: NoAlta.value,
    Telefono: telefono.value,
    UsuarioActual:  docSnap.data().name || null,
  };
if (certificadoOK.value === true ) {
  console.log(certificadoOK.value)
  datos.Certificado = 'N/A';
  console.log(datos.Certificado)
}
// Asegurarse de que la lista de campos opcionales no tenga duplicados ni errores
let camposOpcionalesDinamicos = [...camposOpcionales];

// Si certificadoOK está desactivado, entonces Nota es opcional
if (certificadoOK.value === false) {
  if (!camposOpcionalesDinamicos.includes('Nota')) {
    camposOpcionalesDinamicos.push('Nota');
  }
} else {
  // Si certificadoOK está activado, Nota debe ser obligatoria
  camposOpcionalesDinamicos = camposOpcionalesDinamicos.filter(campo => campo !== 'Nota');
}
    

const camposVacios = Object.entries(datos)
  .filter(([campo, valor]) => 
    !camposOpcionalesDinamicos.includes(campo) && (valor === null || valor === "")
  )
  .map(([campo]) => campo);
  if (camposVacios.length > 0) {
    isButtonDisabled.value = false;
    toast.add({
      severity: "warn",
      summary: "Campos obligatorios",
      detail: `Los siguientes campos están vacíos: ${camposVacios.join(", ")}`,
      life: 3000,
    });
    return;
  }
  const coleccion = federal.value ? "RegistroFederal" : "REGISTRO";
  try {
    await addDoc(collection(db, coleccion), datos);
    // 🔥 Aquí actualizamos el folio:
    const nombreColeccion = linea.value === 'Linea 1' ? 'foliosLinea1' : 'foliosLinea2';
    const foliosRef = collection(db, nombreColeccion);
    const q = query(foliosRef, where("NumeroFolio", "==", certificadoSeleccionado.value));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docFolio = querySnapshot.docs[0];
      await updateDoc(doc(db, nombreColeccion, docFolio.id), {
        Utilizado: true,
        ClienteAsignado: nombreCliente.value || null,
        NombreLogin: docSnap.data().name || null,
        Placa: datos.Placa,
        Estado: datos.Estado,
        Year: datos.Year,
        FechaAlta: datos.FechaAlta,
        Uso: datos.Uso,
        Referencia: datos.Referencia,
        Referencia2: datos.Referencia2,
        CantidadCredito: datos.CantidadCredito,
      });
    }

    toast.add({
      severity: "success",
      summary: "Éxito",
      detail: `✅ Vehículo guardado correctamente en ${coleccion}.`,
      life: 3000,
    });
  } catch (error) {
    console.error("Error al guardar:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "❌ Error al guardar el vehículo. Revisa la consola.",
      life: 3000,
    });
  }
};


</script>

<template> 
    <Fluid class="flex flex-col md:flex-row gap-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <!-- CHECKBOX: CERTIFICADO REALIZADO -->
            <div class="flex items-center space-x-6 font-semibold text-xl">
                <div class="flex items-center space-x-2">
                    <span>Por Hacer</span>
                    <Checkbox v-model="certificadoOK" :binary="true" class="mt-2" />
                </div>
                <div class="flex items-center space-x-2">
                    <span>          </span>
                </div>
                <div class="flex items-center space-x-2">
                    <span>Registro Federal</span>
                    <Checkbox v-model="federal" :binary="true" class="mt-2" />
                </div>
            </div>
            
            <!-- 🔹 CAMPOS QUE SIEMPRE SE MOSTRARÁN -->
            <div v-if="!certificadoOK" class="font-semibold text-xl">Seleccion de Linea      
                <Select v-model="linea" :options="listLineas"  placeholder="Select" filter/>
            </div> 
            
            <div class="font-semibold text-xl">
              Nota
              <span class="text-sm font-normal text-gray-500">
                {{ certificadoOK ? '' : '(opcional)' }}
              </span>
              <InputText
                v-model="nota"
                type="text"
                placeholder="Agrega Nota"
                @input="filtrarAlfanumerico"
              />
            </div>
            
            <div class="font-semibold text-xl">Placa
                <InputText v-model="placa" type="text" placeholder="Agregar Placa" />
            </div>
            
            <div class="font-semibold text-xl">Combustible        
                <Select v-model="combustible" :options="listCombustible" optionLabel="name" placeholder="Select" filter/>
            </div>  

            <div class="font-semibold text-xl">Uso
              <Select v-model="uso" :options="listUso" optionLabel="name" placeholder="Select" filter/>
            </div>

            <div class="font-semibold text-xl">Año
                <Select v-model="year" :options="listAno" optionLabel="name" placeholder="Selecciona un año" filter />
            </div>

            <div class="font-semibold text-xl">Nombre de Cliente
                <IconField>
                    <InputIcon class="pi pi-user" />
                    <InputText v-model="nombreCliente" type="text" placeholder="Name" />
                </IconField>
            </div>
            <div class="font-semibold text-xl">Correo Electrónico <span class="text-sm font-normal text-gray-500"> (opcional)</span>
                <InputText v-model="gmail" type="email" placeholder="Introduce el correo electrónico" />
            </div>

            <div class="font-semibold text-xl">Teléfono<span class="text-sm font-normal text-gray-500"> (opcional)</span>
              <InputText
                v-model="telefono"
                type="tel"
                placeholder="Introduce el número de teléfono"
                @input="formatearTelefono"
                maxlength="13"
              />
            </div>

            <div class="font-semibold text-xl">
                Estatus de Multa
                <Select 
                    v-model="estatusMulta" 
                    :options="listMulta" 
                    placeholder="Estatus de Multa" 
                    filter 
                />
            </div>
            
            <div
              v-if="estatusMulta  === 'Pago Pendiente'"
              class="font-semibold text-xl"
            >
              Numero de Serie <span class="text-sm font-normal text-gray-500"> (opcional)</span>
              <InputText v-model="noSerie" type="text" placeholder="Numero de Serie" />
            </div>

            <div class="font-semibold text-xl">Multa<span class="text-sm font-normal text-gray-500"> (opcional)</span>
                <InputGroup>
                    <InputNumber v-model="multa" placeholder="Price" />
                    <InputGroupAddon>$</InputGroupAddon>
                    <InputGroupAddon>.00</InputGroupAddon>
                </InputGroup>
            </div>

            <div class="font-semibold text-xl">Costo
                <InputGroup>
                    <InputNumber v-model="costo" placeholder="Price" />
                    <InputGroupAddon>$</InputGroupAddon>
                    <InputGroupAddon>.00</InputGroupAddon>
                </InputGroup>
            </div>
            
            <div  class="font-semibold text-xl">Cantidad/Crédito
                <Select v-model="cantidadCredito" :options="listCredito" optionLabel="name" placeholder="Forma de Pago" filter/>
            </div>

            <div class="font-semibold text-xl">Fecha de Pago <span class="text-sm font-normal text-gray-500"> (opcional)</span>
                <DatePicker v-model="fechaPago" :showIcon="true" :showButtonBar="true" placeholder="Seleccionar fecha"></DatePicker>
            </div>

            <div class="font-semibold text-xl">Referencia
                <InputText v-model="referencia" type="text" placeholder="Referencia" />
            </div>

            <div class="font-semibold text-xl">
              Otra Referencia <span class="text-sm font-normal text-gray-500"> (opcional)</span>
              <InputText v-model="referencia2" type="text" placeholder="Otra Referencia" />
            </div>

            <!-- 🔹 CAMPOS QUE SOLO SE MUESTRAN SI certificadoOK ESTÁ DESACTIVADO -->
            <div v-if="!certificadoOK" class="font-semibold text-xl">Fecha Registro
                <DatePicker v-model="fechaRegistro" :showIcon="true" :showButtonBar="true" placeholder="Seleccionar fecha"></DatePicker>
            </div>
            <div class="font-semibold text-xl">Numero de Alta<span class="text-sm font-normal text-gray-500"> (opcional)</span>
                <InputText v-model="NoAlta" type="number" placeholder="Numero de Alta" />
            </div>
            <div v-if="!certificadoOK" class="font-semibold text-xl">Fecha De Alta <span class="text-sm font-normal text-gray-500"> (opcional)</span>
                <DatePicker v-model="fechaAlta" :showIcon="true" :showButtonBar="true" placeholder="Seleccionar fecha"></DatePicker>
            </div>

            <div class="font-semibold text-xl">
                Estado
                <Select 
                    v-model="estado" 
                    :options="listEstados" 
                    placeholder="Selecciona un estado" 
                    filter 
                />
            </div>
            
            <div  v-if="!certificadoOK" class="font-semibold text-xl">Certificados Disponibles
                <Select 
                    v-model="certificadoSeleccionado"
                    :options="certificadosDisponibles"
                    optionLabel="label" 
                    optionValue="value" 
                    placeholder="Selecciona un certificado" 
                    filter
                />
            </div>
            <!-- BOTÓN PARA GUARDAR -->
            <div  class="col-span-1 md:col-span-3 flex flex-col items-center gap-y-4 w-full">
              <Button 
                  label="Finalizar Registro del Vehículo" 
                  @click="guardarVehiculo" 
                  :disabled="isButtonDisabled"
                  severity="primary" 
                  class="p-button-rounded w-full mt-2" 
                />

                <Button 
                  label="Limpiar Registro" 
                  icon="pi pi-trash" 
                  @click="limpiarCampos" 
                  severity="danger" 
                  class="p-button-rounded w-full mt-2" 
                />
            </div>
        </div>
    </Fluid>
</template>

