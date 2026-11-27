<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { listerObjetsTrouves, type ObjetTrouveListe } from '@/services/objetsTrouves'

const objets = ref<ObjetTrouveListe[]>([])
const chargementEnCours = ref(true)

onMounted(async () => {
  objets.value = await listerObjetsTrouves()
  chargementEnCours.value = false
})

const lignesDuTableau = computed(() =>
  objets.value.map((objet) => [objet.description, objet.lieu, objet.dateDecouverte]),
)
</script>

<template>
  <h1>Objets trouvés</h1>
  <p>Retrouvez ici les objets déposés à l’accueil de la mairie, du plus récent au plus ancien.</p>

  <div role="status">
    <p v-if="!chargementEnCours && objets.length === 0" class="fr-mb-0">Aucun objet n’est enregistré pour le moment.</p>
  </div>

  <DsfrTable
    v-if="!chargementEnCours && objets.length > 0"
    title="Objets trouvés déposés à l’accueil"
    :headers="['Description', 'Lieu de découverte', 'Date de découverte']"
    :rows="lignesDuTableau"
  />

  <p class="fr-mt-3w fr-mb-0">
    Vous avez trouvé un objet ? <RouterLink to="/objets-trouves/nouveau">Enregistrez-le</RouterLink> pour le déclarer à l’accueil.
  </p>
</template>
