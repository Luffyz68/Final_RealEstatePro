import { createRouter, createWebHistory } from 'vue-router';

import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';

import MainLayout from '@/layouts/MainLayout.vue';
import AdminLayout from '@/layouts/AdminLayout.vue';
import AgentLayout from '@/layouts/AgentLayout.vue';


import HomeView from '@/views/HomeView.vue';
import AboutView from '@/views/AboutView.vue';
import PropertiesView from '@/views/PropertiesView.vue';
import PropertyDetailView from '@/views/PropertyDetailView.vue';

import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';

import FavoritesView from '@/views/FavoritesView.vue';
import ProfileView from '@/views/ProfileView.vue';
import MyInquiriesView from '@/views/MyInquiriesView.vue';
import MyAppointmentsView from '@/views/MyAppointmentsView.vue';
import MyServiceRequestsView from '@/views/MyServiceRequestsView.vue';
import CustomerDashboardView from '@/views/CustomerDashboardView.vue';

import NotFoundView from '@/views/NotFoundView.vue';


import AdminDashboardView from '@/views/admin/AdminDashboardView.vue';
import AdminUsersView from '@/views/admin/UsersView.vue';
import AdminPropertiesView from '@/views/admin/PropertiesView.vue';
import AdminPropertyTypesView from '@/views/admin/PropertyTypesView.vue';
import AdminLocationsView from '@/views/admin/LocationsView.vue';
import AdminInquiriesView from '@/views/admin/InquiriesView.vue';
import AdminAppointmentsView from '@/views/admin/AppointmentsView.vue';
import AdminServiceRequestsView from '@/views/admin/ServiceRequestsView.vue';

import AgentDashboardView from '@/views/agent/AgentDashboardView.vue';
import AgentMyPropertiesView from '@/views/agent/MyPropertiesView.vue';


const routes = [


  {
    path: '/',
    component: MainLayout,

    children: [
      {
        path: '',
        name: 'home',
        component: HomeView,
        meta: {
          title: 'Home'
        }
      },

      {
        path: 'about',
        name: 'about',
        component: AboutView,
        meta: {
          title: 'About Us'
        }
      },

      {
        path: 'properties',
        name: 'properties',
        component: PropertiesView,
        meta: {
          title: 'Properties'
        }
      },

      {
        path: 'properties/:id',
        name: 'property-detail',
        component: PropertyDetailView,
        props: true,
        meta: {
          title: 'Property Details'
        }
      },



      {
        path: 'login',
        name: 'login',
        component: LoginView,
        meta: {
          title: 'Login',
          guestOnly: true
        }
      },

      {
        path: 'register',
        name: 'register',
        component: RegisterView,
        meta: {
          title: 'Create Account',
          guestOnly: true
        }
      },



      {
        path: 'dashboard',
        name: 'customer-dashboard',
        component: CustomerDashboardView,
        meta: {
          title: 'My Dashboard',
          requiresAuth: true,
          roles: ['customer']
        }
      },

      {
        path: 'favorites',
        name: 'favorites',
        component: FavoritesView,
        meta: {
          title: 'My Favorites',
          requiresAuth: true,
          roles: ['customer']
        }
      },

      {
        path: 'profile',
        name: 'profile',
        component: ProfileView,
        meta: {
          title: 'My Profile',
          requiresAuth: true
        }
      },

      {
        path: 'my-inquiries',
        name: 'my-inquiries',
        component: MyInquiriesView,
        meta: {
          title: 'My Inquiries',
          requiresAuth: true,
          roles: ['customer']
        }
      },

      {
        path: 'my-appointments',
        name: 'my-appointments',
        component: MyAppointmentsView,
        meta: {
          title: 'My Appointments',
          requiresAuth: true,
          roles: ['customer']
        }
      },

      {
        path: 'my-service-requests',
        name: 'my-service-requests',
        component: MyServiceRequestsView,
        meta: {
          title: 'My Service Requests',
          requiresAuth: true,
          roles: ['customer']
        }
      }
    ]
  },


  {
    path: '/admin',

    component: AdminLayout,

    meta: {
      requiresAuth: true,
      roles: ['admin']
    },

    children: [
      {
        path: '',
        redirect: {
          name: 'admin-dashboard'
        }
      },

      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: AdminDashboardView,
        meta: {
          title: 'Admin Dashboard'
        }
      },

      {
        path: 'users',
        name: 'admin-users',
        component: AdminUsersView,
        meta: {
          title: 'Users & Agents'
        }
      },

      {
        path: 'properties',
        name: 'admin-properties',
        component: AdminPropertiesView,
        meta: {
          title: 'Property Management'
        }
      },

      {
        path: 'property-types',
        name: 'admin-property-types',
        component: AdminPropertyTypesView,
        meta: {
          title: 'Property Types'
        }
      },

      {
        path: 'locations',
        name: 'admin-locations',
        component: AdminLocationsView,
        meta: {
          title: 'Locations'
        }
      },

      {
        path: 'inquiries',
        name: 'admin-inquiries',
        component: AdminInquiriesView,
        meta: {
          title: 'Property Inquiries'
        }
      },

      {
        path: 'appointments',
        name: 'admin-appointments',
        component: AdminAppointmentsView,
        meta: {
          title: 'Appointments'
        }
      },

      {
        path: 'service-requests',
        name: 'admin-service-requests',
        component: AdminServiceRequestsView,
        meta: {
          title: 'Service Requests'
        }
      },

      {
        path: 'profile',
        name: 'admin-profile',
        component: ProfileView,
        meta: {
          title: 'Admin Profile'
        }
      }
    ]
  },

  {
    path: '/agent',

    component: AgentLayout,

    meta: {
      requiresAuth: true,
      roles: ['agent', 'admin']
    },

    children: [
      {
        path: '',
        redirect: {
          name: 'agent-dashboard'
        }
      },

      {
        path: 'dashboard',
        name: 'agent-dashboard',
        component: AgentDashboardView,
        meta: {
          title: 'Agent Dashboard'
        }
      },

      {
        path: 'properties',
        name: 'agent-properties',
        component: AgentMyPropertiesView,
        meta: {
          title: 'My Properties'
        }
      },

      {
        path: 'inquiries',
        name: 'agent-inquiries',
        component: AdminInquiriesView,
        meta: {
          title: 'Property Inquiries'
        }
      },

      {
        path: 'appointments',
        name: 'agent-appointments',
        component: AdminAppointmentsView,
        meta: {
          title: 'Appointments'
        }
      },

      {
        path: 'profile',
        name: 'agent-profile',
        component: ProfileView,
        meta: {
          title: 'Agent Profile'
        }
      }
    ]
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: {
      title: 'Page Not Found'
    }
  }
];

const router = createRouter({
  history: createWebHistory(),

  routes,

  scrollBehavior(to, from, savedPosition) {


    if (savedPosition) {
      return savedPosition;
    }

    if (to.meta.scrollToTop === false) {
      return;
    }

    return {
      top: 0,
      behavior: 'smooth'
    };
  }
});


const getDashboardForRole = role => {
  switch (role) {
    case 'admin':
      return {
        name: 'admin-dashboard'
      };

    case 'agent':
      return {
        name: 'agent-dashboard'
      };

    case 'customer':
      return {
        name: 'customer-dashboard'
      };

    default:
      return {
        name: 'home'
      };
  }
};


router.beforeEach(async to => {
  const authStore = useAuthStore();
  const uiStore = useUiStore();

  uiStore.setRouteLoading(true);

  const isAuthenticated = authStore.isAuthenticated;
  const userRole = authStore.user?.role;

  if (to.meta.guestOnly && isAuthenticated) {
    return getDashboardForRole(userRole);
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    return {
      name: 'login',

      query: {
        redirect: to.fullPath
      }
    };
  }

  if (
    to.meta.roles &&
    Array.isArray(to.meta.roles) &&
    !to.meta.roles.includes(userRole)
  ) {
    return getDashboardForRole(userRole);
  }


  return true;
});


router.afterEach(to => {
  const uiStore = useUiStore();

  uiStore.setRouteLoading(false);

  const appName = 'RealEstatePro';

  document.title = to.meta.title
    ? `${to.meta.title} | ${appName}`
    : appName;
});

router.onError(error => {
  const uiStore = useUiStore();

  uiStore.setRouteLoading(false);

  console.error('[Router Error]', error);
});

export default router;