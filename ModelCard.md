### Model_Name ###
News_Categorization_MNB.ipynb
## Author Info ##
## Dataset ##
### description ###

### link ###

## References ##
## Libraries Used ##
#### From the library pandas ####
import pandas as pd    START:3	 END:146

#### From the library numpy ####
import numpy as np    START:77	 END:146

#### From the library matplotlib ####
import matplotlib.pyplot as plt    START:104	 END:129

#### From the library sklearn ####
from sklearn.utils import shuffle    START:51	 END:64

from sklearn.feature_extraction.text import TfidfTransformer    START:73	 END:90

from sklearn.naive_bayes import MultinomialNB    START:74	 END:90

from sklearn.pipeline import Pipeline    START:75	 END:90

from sklearn import metrics    START:76	 END:146

#### From the library OTHER ####
import pylab as pl    START:40	 END:146

import itertools    START:103	 END:146

## Pre ##
## Other ##
### cell_ids ###
0,2,3,5,6,7,8,9,11,13,14,15,16,17,18
### cells ###
[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object]
### lineNumbers ###
1,2,10,11,12,13,14,15,16,17,18,19,20,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,99,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149
### source ###
``` 
#%matplotlib inline
import pandas as pd def import_data():
    global titles, labels, categories
    # importing news aggregator data via Pandas (Python Data Analysis Library)
    news = pd.read_csv("uci-news-aggregator.csv")
    # function 'head' shows the first 5 items in a column (or
    # the first 5 rows in the DataFrame)
    print(news.head())
    categories = news['CATEGORY']
    titles = news['TITLE']
    labels = sorted(list(set(categories)))    #%time import_data()import pylab as pl # useful for drawing graphics

def categories_pie_plot(cont,tit):
    global labels
    sizes = [cont[l] for l in labels]
    pl.pie(sizes, explode=(0, 0, 0, 0), labels=labels,
        autopct='%1.1f%%', shadow=True, startangle=90)
    pl.title(tit)
    pl.show()
    
categories_pie_plot(cont,"Plotting categories")from sklearn.utils import shuffle # Shuffle arrays in a consistent way

X_train = []
y_train = []
X_test = []
y_test = []

def split_data():
    global titles, categories
    global X_train, y_train, X_test, y_test,labels
    N = len(titles)
    Ntrain = int(N * 0.7)    
    # Let's shuffle the data
    titles, categories = shuffle(titles, categories, random_state=0)
    X_train = titles[:Ntrain]
    y_train = categories[:Ntrain]
    X_test = titles[Ntrain:]
    y_test = categories[Ntrain:]#%time split_data()cont2 = count_data(labels,y_train)categories_pie_plot(cont2,"Categories % in training set")#%time predicted = train_test()print(metrics.classification_report(y_test, predicted, target_names=labels))mat = metrics.confusion_matrix(y_test, predicted,labels=labels)
cm = mat.astype('float') / mat.sum(axis=1)[:, np.newaxis]
cmimport itertools
import matplotlib.pyplot as plt

def plot_confusion_matrix(cm, classes,
                          title='Confusion matrix',
                          cmap=plt.cm.Blues):
    """
    This function prints and plots the confusion matrix.
    """
    plt.imshow(cm, interpolation='nearest', cmap=cmap)
    plt.title(title)
    plt.colorbar()
    tick_marks = np.arange(len(classes))
    plt.xticks(tick_marks, classes, rotation=45)
    plt.yticks(tick_marks, classes)

    thresh = cm.max() / 2.
    for i, j in itertools.product(range(cm.shape[0]), range(cm.shape[1])):
        plt.text(j, i, '{:5.2f}'.format(cm[i, j]),
                 horizontalalignment="center",
                 color="white" if cm[i, j] > thresh else "black")

    plt.tight_layout()
    plt.ylabel('True label')
    plt.xlabel('Predicted label')
    plt.colorbar()
    plt.show()plot_confusion_matrix(cm, labels, title='Confusion matrix')def resume_data(labels,y_train,f1s):
    c = Counter(y_train)
    cont = dict(c)
    tot = sum(list(cont.values()))
    nlabels = len(labels)
    d = {
        "category" : [labels[i] for i in range(nlabels)],
        "percent" : [cont[labels[i]]/tot for i in range(nlabels)],
        "f1-score" : [f1s[i] for i in range(nlabels)]
    }
   
    print(pd.DataFrame(d))   
    print("total \t",tot) 
    return contf1s = metrics.f1_score(y_test, predicted, labels=labels, average=None)
cont3 = resume_data(labels,y_train,f1s)
 ```
### functions ###

### figures ###

### description ###

## Data Cleaning ##
### cell_ids ###
1
### cells ###
[object Object]
### lineNumbers ###
3,4,5,6,7,8,9
### source ###
``` 
# Data Cleaning #titles = [] # list of news titles
categories = [] # list of news categories
labels = [] # list of different categories (without repetitions)
nlabels = 4 # number of different categories
lnews = [] # list of dictionaries with two fields: one for the news and 
            # the other for its category
 ```
### functions ###

### figures ###

### description ###

## Preprocessing ##
### cell_ids ###
4
### cells ###
[object Object]
### lineNumbers ###
21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40
### source ###
``` 
# Preprocessing #from collections import Counter

def count_data(labels,categories):    
    c = Counter(categories)
    cont = dict(c)
    # total number of news
    tot = sum(list(cont.values()))     
    d = {
        "category" : labels,
        "news" : [cont[l] for l in labels],
        "percent" : [cont[l]/tot for l in labels]
    }
   
    print(pd.DataFrame(d))   
    print("total \t",tot) 
    
    return cont

cont = count_data(labels,categories)
 ```
### functions ###

### figures ###

### description ###

## Hyperparameters ##
### cell_ids ###

### cells ###

### lineNumbers ###

### source ###
``` 

 ```
### values ###

## Model Training ##
### cell_ids ###
10
### cells ###
[object Object]
### lineNumbers ###
73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98
### source ###
``` 
# Model Training #from sklearn.feature_extraction.text import CountVectorizer 
from sklearn.feature_extraction.text import TfidfTransformer 
from sklearn.naive_bayes import MultinomialNB 
from sklearn.pipeline import Pipeline 
from sklearn import metrics 
import numpy as np
import pprint

# lmats = [] # list of confussion matrix 
nrows = nlabels
ncols = nlabels
# conf_mat_sum = np.zeros((nrows, ncols))
# f1_acum = [] # list of f1-score

def train_test():
    global X_train, y_train, X_test, y_test, labels 
    #lmats, \
     #       conf_mat_sum, f1_acum, ncategories
    text_clf = Pipeline([('vect', CountVectorizer()),
                         ('tfidf', TfidfTransformer()),
                         ('clf', MultinomialNB()),
                         ])
    text_clf = text_clf.fit(X_train, y_train)
    predicted = text_clf.predict(X_test)
    return predicted
 ```
### functions ###

### figures ###

### description ###

## Evaluation ##
### cell_ids ###
12
### cells ###
[object Object]
### lineNumbers ###
100,101
### source ###
``` 
# Model Evaluation #metrics.accuracy_score(y_test, predicted)
 ```
### functions ###

### figures ###

### description ###

