<script setup>
import { computed } from 'vue';
import AppMenuItem from './AppMenuItem.vue';
import { useAuth } from '@/composables/useAuth';

const { isAdmin } = useAuth();

const model = computed(() => {
    // Materiales: Usuario solo ve el stock, Admin puede disponer y dar de alta
    const materialItems = [
        { label: 'Stock', icon: 'pi pi-table', to: '/sistema/materiales/materialesRead' }
    ];
    if (isAdmin.value) {
        materialItems.push(
            { label: 'Disponer', icon: 'pi pi-box', to: '/sistema/materiales/materiales' },
            { label: 'Nuevos', icon: 'pi pi-upload', to: '/sistema/materiales/movimientos' },
            { label: 'Importar Nota', icon: 'pi pi-file-import', to: '/sistema/materiales/importarFactura' },
            { label: 'Logs', icon: 'pi pi-list', to: '/sistema/materiales/reporte' }
        );
    }

    // Herramientas: Usuario solo ve la tabla, Admin puede asignar, registrar y ver historial
    const herramientasItems = [
        { label: 'Tabla', icon: 'pi pi-table', to: '/sistema/herramientas/TablaHerramienta' }
    ];
    if (isAdmin.value) {
        herramientasItems.push(
            { label: 'Asignación Manual', icon: 'pi pi-pencil', to: '/sistema/herramientas/RegistroHerramientas' },
            { label: 'Asignación Rápida', icon: 'pi pi-plus-circle', to: '/sistema/herramientas/AsignarAllHerramienta' },
            { label: 'Alta', icon: 'pi pi-upload', to: '/sistema/Configuraciones/AltaHerramienta' },
            { label: 'Logs', icon: 'pi pi-list', to: '/sistema/herramientas/logsHerramientas' }
        );
    }

    const menuItems = [
        {
            icon: 'pi pi-check',
            items: [
                { label: 'Material', icon: 'pi pi-box', items: materialItems },
                { label: 'Herramientas', icon: 'pi pi-wrench', items: herramientasItems }
            ]
        }
    ];

    // Asistencias — Mi asistencia para todos, Nómina solo Admin
    menuItems[0].items.push({
      label: 'Asistencias',
      icon: 'pi pi-calendar',
      items: [
        { label: 'Mi Asistencia', icon: 'pi pi-clock', to: '/sistema/asistencias/mi-asistencia' },
        ...(isAdmin.value ? [
          { label: 'Nómina', icon: 'pi pi-wallet', to: '/sistema/asistencias/nomina' },
          { label: 'Kiosco', icon: 'pi pi-desktop', to: '/kiosco', target: '_blank' },
        ] : [])
      ]
    });

    // Configuraciones solo para Admin
    if (isAdmin.value) {
        menuItems[0].items.push({
            label: 'Configuraciones',
            icon: 'pi pi-cog',
            items: [
                { label: 'Alertas Config', icon: 'pi pi-bell', to: '/sistema/Configuraciones/AlertasConfig' },
                { label: 'Editar Herramientas', icon: 'pi pi-wrench', to: '/sistema/Configuraciones/Herramientas' },
                { label: 'Registro Usuario', icon: 'pi pi-user', to: '/sistema/Configuraciones/RegistroUsuario' },
                { label: 'WhatsApp', icon: 'pi pi-comments', to: '/sistema/Configuraciones/Whatsapp' }
            ]
        });
    }

    return menuItems;
});
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="i">
            <app-menu-item v-if="!item.separator" :item="item" :index="i" />
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>
