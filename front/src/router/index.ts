import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import EnregistrerObjetView from '../views/EnregistrerObjetView.vue'

const TITRE_SERVICE = 'Objets trouvés'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'accueil', component: HomeView, meta: { titre: TITRE_SERVICE } },
    {
      path: '/objets-trouves/nouveau',
      name: 'enregistrer-objet',
      component: EnregistrerObjetView,
      meta: { titre: `Enregistrer un objet trouvé – ${TITRE_SERVICE}` },
    },
  ],
})

// Titre de page explicite à chaque changement de page (RGAA 8.5).
router.afterEach((destination) => {
  document.title = typeof destination.meta.titre === 'string' ? destination.meta.titre : TITRE_SERVICE
})

export default router
