<script setup lang="ts">
import { computed, ref } from 'vue'
import { enregistrerObjetTrouve } from '@/services/objetsTrouves'
import {
  dateDuJour,
  erreursDeLaSaisie,
  type ErreursObjetTrouve,
} from '@/services/objetsTrouvesValidation'


const description = ref('')
const lieu = ref('')
const dateDecouverte = ref('')
const erreurs = ref<ErreursObjetTrouve>({})
const confirmation = ref('')
const erreurGenerale = ref('')
const enCours = ref(false)
const aujourdhui = dateDuJour()

const resumeErreurs = computed(() => {
  const nombre = Object.keys(erreurs.value).length
  if (nombre === 0) return ''
  return nombre === 1 ? 'Le formulaire contient 1 erreur.' : `Le formulaire contient ${nombre} erreurs.`
})

function viderFormulaire() {
  description.value = ''
  lieu.value = ''
  dateDecouverte.value = ''
}

async function enregistrer() {
  confirmation.value = ''
  erreurGenerale.value = ''
  erreurs.value = erreursDeLaSaisie({
    description: description.value,
    lieu: lieu.value,
    dateDecouverte: dateDecouverte.value,
  })
  if (Object.keys(erreurs.value).length > 0) return

  enCours.value = true
  const resultat = await enregistrerObjetTrouve({
    description: description.value.trim(),
    lieu: lieu.value.trim(),
    dateDecouverte: dateDecouverte.value,
  })
  enCours.value = false

  if (resultat.reussi) {
    confirmation.value = 'L’objet est bien enregistré.'
    viderFormulaire()
  } else {
    erreurs.value = resultat.erreurs
    erreurGenerale.value = Object.keys(resultat.erreurs).length > 0 ? '' : resultat.message
  }
}
</script>

<template>
  <h1>Enregistrer un objet trouvé</h1>

  <div role="status">
    <DsfrAlert v-if="confirmation" type="success" :description="confirmation" small />
    <DsfrAlert v-if="erreurGenerale" type="error" :description="erreurGenerale" small />
    <p v-if="resumeErreurs" class="fr-text--bold">{{ resumeErreurs }}</p>
  </div>

  <p>Tous les champs sont obligatoires.</p>

  <form novalidate @submit.prevent="enregistrer">
    <DsfrInputGroup
      v-model="description"
      label="Description de l’objet *"
      label-visible
      hint="Par exemple : parapluie bleu, clés avec porte-clés rouge"
      :error-message="erreurs.description"
      is-textarea
      required
    />
    <DsfrInputGroup
      v-model="lieu"
      label="Lieu de découverte *"
      label-visible
      hint="Par exemple : hall d’accueil, jardin public"
      :error-message="erreurs.lieu"
      required
    />
    <DsfrInputGroup
      v-model="dateDecouverte"
      label="Date de découverte *"
      label-visible
      hint="Format attendu : jour/mois/année"
      :error-message="erreurs.dateDecouverte"
      type="date"
      :max="aujourdhui"
      required
    />
    <DsfrButton type="submit" label="Enregistrer l’objet" :disabled="enCours" />
  </form>
</template>
