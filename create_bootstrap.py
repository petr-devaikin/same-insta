import virtualenv
s = '''
import subprocess, os, site, shutil

def get_virtual_site_packages(home_dir):
  sp_path = os.path.join(home_dir, 'lib', 'python*', 'site-packages')
  virtual_sp = glob.glob( sp_path )
  if not virtual_sp or len(virtual_sp) > 1:
    raise EnvironmentError('multiple site-packages' + str(virtual_sp))
  return virtual_sp[0]

def install_opencv(home_dir):
  virtual_sp = get_virtual_site_packages(home_dir)
  for site_packages in site.getsitepackages():
    cv_files = glob.glob( os.path.join(site_packages, 'cv*') )
    for cv_file in cv_files:
      print 'Copying', cv_file, 'to', virtual_sp
      shutil.copy(cv_file, virtual_sp)

def after_install(options, home_dir):
  install_opencv(home_dir)
  pip =  os.path.join(home_dir, 'bin', 'pip')
  subprocess.call([pip, 'install', '-r', 'requirements.txt'])
'''

script = virtualenv.create_bootstrap_script(s)
with open('bootstrap.py','w') as f:
  f.write(script)