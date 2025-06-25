from django.urls import path, re_path
from django.contrib.auth.views import LoginView

from . import views

urlpatterns = [
    path('', views.post_list, name='post_list'),
    path('login/', LoginView.as_view(template_name='blog/login.html'), name='login'),
    path('post/new/', views.post_new, name='post_new'),
    re_path(r'^post/(?P<pk>\d+)/$', views.post_detail, name='post_detail'),
    re_path(r'^post/(?P<pk>\d+)/edit/$', views.post_edit, name='post_edit'),
]
