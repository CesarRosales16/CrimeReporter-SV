# -*- coding: utf-8 -*-
"""ModeloFinal.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1DkETgSi4JAw9ldmODCaVMZU2mVMCf-yM

# **Predicción de homicidios por municipio**
"""

from google.colab import drive
drive.mount('/content/drive')

"""## **Librerias para generación y visualización del dataset**"""

# Importando librerias necesarias para la creación del dataset
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

#Accede a Google Drive para importar los datos, los cuales provienen de una recopilación de bases de datos de indices de criminalidad en el triangulo norte
from google.colab import drive
drive.mount('/content/drive')

"""## **1. Recopilación de datos**
Los datos han sido extraidos de un archivo CSV recuperados de una [recopilación de Bases de Datos sobre indicadores de criminalidad y justicia en el triángulo norte](https://www.aas.jjay.cuny.edu/single-post/base-de-datos?fbclid=IwAR3Itx49fRZJoazPUPWYLpASA3bag7UjRUCzey4pvtec5O9mjdwG9QLboUE), a la cual se puede acceder en el enlace.

**Referencia**: Academy for Security Analysis, John Jay College of Criminal Justice. (2020). *Recopilación de Bases de Datos sobre indicadores de criminalidad y justicia en El Salvador, Guatemala y Honduras*.

Por ser información pública también ha sido anexado para facilitar su consulta.
"""

#Importando datos de CSV
#Referencia: Academy for Security Analysis, John Jay College of Criminal Justice. (2020). Recopilación de Bases de Datos sobre indicadores de criminalidad y justicia en El Salvador, Guatemala y Honduras.
df = pd.read_csv("drive/My Drive/IMLHom.csv")
print(len(df))
df.head()

#Se importan tambien los nombres de los municipios y departamentos del Geoportal del CNR
df_geo = pd.read_csv("drive/My Drive/AllMunWithDept.csv")
print(len(df_geo))
df_geo.head()

"""## **2. Limpieza de datos**
Se procede a eliminar las columnas de dataset que son innecesarias para el modelo, así como a modificar los tipos de datos del mismo.
También se calcula el total de homicidios por año en cada municipio y se agrega esa nueva columna al dataset y finalmente se categorizan los nombres de los municipios.

### 2.1 Municipios y Departamentos del geoportal
"""

#Dado que hay municipios que se llaman igual y pertenecen a diferente departamento 
#Se crea una nueva columna con la concatenacion del departamento y municipio para darle caracter unico
dept_mun_geo = []
for depto, mun in zip(df_geo['nom_dpto'], df_geo['nom_mun']):
  concat_str = depto+','+mun
  dept_mun_geo.append(concat_str)

#Agrega la columna de tiempo
dept_mun_series = pd.Series(dept_mun_geo)
df_geo['nom_dpto_nom_mun'] = dept_mun_series.values
df_geo.head()

#Se crea un array con loss valores unicoss que se añadieron a la tabla
dept_mun_array = list(df_geo.nom_dpto_nom_mun.unique())
print(dept_mun_array)

#Se crea un diccionario que tendra el codigo del la categoria como clave y la concatenacion de depto y mun como valor
encode_dict = {}
for i in range(0, 262):
  encode_dict[i] = dept_mun_array[i]
print(encode_dict)

"""### 2.2 Dataset de homicidios"""

#Modifica el df a solo homicidios con los 4 tipos de armas que tenian más registros: ARMA DE FUEGO o ASF X ESTRANGULACION o OBJETO CONTUNDENTE o CORTOCONTUNDENTE
df = df[df.Tipo_Arma.str.contains('ARMA DE FUEGO|ASF X ESTRANGULACION|OBJETO CONTUNDENTE|CORTOCONTUNDENTE', regex=True)]
print(len(df))

#Se eliminan las columnas innecesarias
df = df.drop(['NoTotal', 'N', 'Mes', 'Fecha', 'Fecha_Completa', 'Dia','Hora', 'Rango_Horario', 'Codigo_Departamento', 'Codigo_Municipio', 'Rango_Edad', 'Clasificacion_Arma', 'Edad', 'Sexo', 'Tipo_Arma'], axis=1)
df.head()

# Correcciones en nombres de departamentos y/o municipios para que esten acorde al geoJSON
df.loc[df.Departamento == 'CABAÑAS', 'Departamento'] = 'CABANAS'
df.loc[df.Municipio == 'CIUDAD DELGADO', 'Municipio'] = 'DELGADO'
df.loc[df.Municipio == 'SAN JOSE CANCASQUE', 'Municipio'] = 'CANCASQUE'
df.loc[df.Municipio == 'MERCEDES  LA CEIBA', 'Municipio'] = 'MERCEDES LA CEIBA'
df.loc[df.Municipio == 'MERCEDES LA CEIBA', 'Departamento'] = 'LA PAZ'
df.loc[df.Municipio == 'MERCEDES UMAÑA', 'Municipio'] = 'MERCEDES UMANA'
df.loc[df.Municipio == 'NAHUILINGO', 'Municipio'] = 'NAHULINGO'
df.loc[df.Municipio == 'NAHUILINGO', 'Municipio'] = 'NAHULINGO'
df.loc[df.Municipio == 'NUEVA EDEN DE SAN JUAN', 'Municipio'] = 'NUEVO EDEN DE SAN JUAN'
df.loc[df.Municipio == 'OSCICALA', 'Municipio'] = 'OSICALA'
df.loc[df.Municipio == 'SAN BUENAVENTURA', 'Municipio'] = 'SAN BUENA VENTURA'
df.loc[df.Municipio == 'AHUACHAPAN', 'Departamento'] = 'AHUACHAPAN'
df.loc[df.Municipio == 'COMALAPA', 'Departamento'] = 'CHALATENANGO'

# Se concatena el nombre de departamento y municipio para el df de homicidios
dept_mun_df = []
for depto, mun in zip(df['Departamento'], df['Municipio']):
  df_concat = depto+','+mun
  dept_mun_df.append(df_concat)

#Agrega la columna concatenada
dm_df_series = pd.Series(dept_mun_df)
df['dept_mun_str'] = dm_df_series.values
df.head()

#Se eliminan otras columnas innecesarias
df = df.drop(['Municipio', 'Departamento'], axis=1)
df.head()

#Creamos una copia de la columna año para hacer el count()
df["AñoAux"] = df["Año"]

#Guardamos el df agrupado para luego asignar los totales a cada fila del df original
df_g = df.groupby(['dept_mun_str', 'Año']).count()

#Creamos la columna de total y la asignamos al df
total_array = []
for deptmun, año in zip(df["dept_mun_str"], df["Año"]):
  total_array.append(df_g.loc[deptmun,año].AñoAux)

total_values = pd.Series(total_array)
df['Total'] = total_values.values
df.head()

#Elimina la columna auxiliar
df.drop(['AñoAux'], axis = 1, inplace=True)
df.head()

# Se agrega el codigo de depto_mun para categorizar el municipio
encodes_array = []
for dm in df["dept_mun_str"]:
  i = dept_mun_array.index(dm)
  encodes_array.append(i)

# Se agrega la columna de valores de categorias al df
encoded_series = pd.Series(encodes_array)
df['Municipio_encode'] = encoded_series.values
df.head()

#Eliminamos la columna dept_mun_str para el df final y convertimos los tipos de datos
final_df = df.drop(['dept_mun_str'], axis = 1, inplace=False)
final_df = final_df.convert_dtypes()
final_df.head()

"""## **3. Gráfico de totales por año.**
Se grafica la nube de puntos que tenemos en el dataset, donde se puede percibir que hay una gran variabilidad entre los datos, y que probablemente no sigan ningún tipo de tendencia.
"""

# Graficamos el total de homicidios por año para evaluar la 'tendencia'
final_df.plot(x ='Año', y='Total', kind = 'scatter', color ="red")
plt.show()

"""## **4. Modelo de predicción de cantidad de homicidos**
El objetivo del modelo es determinar si a través de un año y municipio es posible encontrar un patrón o relación histórica con las cantidad (total) de homicidios en el mismo.
"""

#Definimos las variables x e y, dado un año y municipio se busca predecir cuandos homicidios habran
x = final_df[['Año', 'Municipio_encode']]
y = final_df[['Total']]

#Separamos el data set en 80% train y 20% test
from sklearn.model_selection import  train_test_split
x_train, x_test, y_train, y_test = train_test_split(x,y, test_size=0.2, random_state=42)

"""#### **Epsilon-Support Vector Regression con kernel Radial basis function (rbf)**"""

#Aplicamos el algoritmo de Epsilon-Support Vector Regression
from sklearn.svm import SVR

svr_rbf = SVR(kernel='rbf', C=100, gamma=0.1, epsilon=.1)
svr_rbf.fit(x_train,y_train.values.ravel())

y_pred_rbf = svr_rbf.predict(x_test)

"""Se obtiene un coeficiente de correlación ($R^2$) de 92.43% al entrenar el modelo y de un 91.99% al predecir los valores de $y$ comparado con los valores reales del dataset."""

#Obtenemos el coeficiente de determinacion para evaluar cuanto se ajusta el modelo
from sklearn.metrics import r2_score

r2_score_train = svr_rbf.score(x_train,y_train)
print('R^2 train: '+str(r2_score_train))

r2_score_test = r2_score(y_test,y_pred_rbf)
print('R^2 test: '+str(r2_score_test))

"""### **Guardar el modelo**"""

#Se guarda el modelo
import joblib

filename_model = 'modelo_rbf.pkl'
joblib.dump(svr_rbf, filename_model)

#Se guarda el diccionario que contiene el codigo de categoria como key y como value la concatenacion del departamento y municipio
filename_dict = 'encode_mun.pkl'
joblib.dump(encode_dict, filename_dict)

#Se carga el modelo guardado para verificar su correcto funcionamiento
loaded_model = joblib.load(filename_model)
y_load = loaded_model.predict(x_test)

print(r2_score(y_test, y_load))

#Se carga el diccionario guardado
loaded_dict = joblib.load(filename_dict)

print(loaded_dict)